import { Router, Request, Response } from 'express';

const router = Router();

// POST /api/v1/gst/check
// body: { amount: number, gstPct: number, servicePct: number, roomRate?: number }
router.post('/check', (req: Request, res: Response) => {
  const { amount, gstPct, servicePct = 0, roomRate = 0 } = req.body;

  if (!amount || !gstPct) {
    return res.status(400).json({ error: 'amount and gstPct are required' });
  }

  const correctGst = roomRate >= 7500 ? 18 : 5;
  const gstOk = gstPct <= correctGst;
  const scOk = servicePct === 0;
  const legal = gstOk && scOk;

  const gstCharged = (amount * gstPct) / 100;
  const gstCorrect = (amount * correctGst) / 100;
  const scAmount = (amount * servicePct) / 100;
  const overcharge = Math.max(0, gstCharged - gstCorrect) + scAmount;

  const violations = [];
  if (!gstOk) {
    violations.push({
      type: 'GST_OVERCHARGE',
      message: `GST charged at ${gstPct}%, should be ${correctGst}%`,
      law: 'CGST Act Third Schedule / Notification 11/2017-CT(Rate)',
      amount: gstCharged - gstCorrect,
    });
  }
  if (!scOk) {
    violations.push({
      type: 'SERVICE_CHARGE',
      message: `Service charge of ${servicePct}% is banned`,
      law: 'CCPA Guidelines on Unfair Trade Practices, July 2022',
      amount: scAmount,
    });
  }

  return res.json({
    legal,
    correctGstPct: correctGst,
    gstCharged,
    gstCorrect,
    scAmount,
    totalOvercharge: overcharge,
    violations,
    complaintUrl: !legal ? 'https://consumerhelpline.gov.in' : null,
  });
});

export default router;
