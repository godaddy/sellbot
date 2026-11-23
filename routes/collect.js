const router = require("express").Router();
const poynt = require("../lib/poynt");
const validate = require("../lib/validate");
const util = require("util");

// Returns only the fields the Collect page reads, never the raw SDK error.
function sendError(res, err, fallback) {
  res.status(400).send({
    name: (err && err.name) || "RequestError",
    httpStatus: (err && err.httpStatus) || 400,
    statusCode: err && err.statusCode,
    developerMessage: (err && err.developerMessage) || fallback,
  });
}

router.get("/", (req, res) => {
  const requestedBusinessId = req.query.businessId;
  res.render("collect/v2", {
    applicationId: global.configs.applicationId,
    businessId: validate.isUuid(requestedBusinessId)
      ? requestedBusinessId
      : global.configs.collectBusinessId,
    theme: validate.isSlug(req.query.theme) ? req.query.theme : "customer",
    page: "collect-v2",
  });
});

router.post("/tokenize", async (req, res) => {
  if (!validate.isUuid(req.body.businessId) || !validate.isToken(req.body.nonce)) {
    return sendError(res, null, "Invalid businessId or nonce");
  }
  var tokenized;
  try {
    const asyncTokenizeCard = util.promisify(poynt.tokenizeCard).bind(poynt);
    tokenized = await asyncTokenizeCard({
      businessId: req.body.businessId,
      nonce: req.body.nonce,
    });
  } catch (err) {
    console.log("Tokenization failed", err);
    return sendError(res, err, "Tokenization failed");
  }

  res.status(200).send(tokenized);
});

router.post("/charge", async (req, res) => {
  if (!validate.isUuid(req.body.businessId)) {
    return sendError(res, null, "Invalid businessId");
  }
  if (!validate.isToken(req.body.token) && !validate.isToken(req.body.nonce)) {
    return sendError(res, null, "Missing funding source: nonce or token");
  }
  var charge;
  try {
    const asyncChargeToken = util.promisify(poynt.chargeToken).bind(poynt);
    var chargeRequest = {
      businessId: req.body.businessId,
      action: "SALE",
      amounts: {
        transactionAmount: req.body.amount,
        orderAmount: req.body.amount,
      },
      currency: "USD",
      emailReceipt: !!req.body.emailAddress,
      partialAuthEnabled: false,
      receiptEmailAddress: req.body.emailAddress,
    };
    if (validate.isToken(req.body.token)) {
      chargeRequest.token = req.body.token;
    } else {
      chargeRequest.nonce = req.body.nonce;
    }
    charge = await asyncChargeToken(chargeRequest);
  } catch (err) {
    console.log("Charge failed", err);
    return sendError(res, err, "Charge failed");
  }

  res.status(200).send(charge);
});

module.exports = router;
