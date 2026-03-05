const { Cashfree, CFEnvironment } = require('cashfree-pg');
const { User, Payment, TokenPackage } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Initialize Cashfree
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'
  ? CFEnvironment.PRODUCTION
  : CFEnvironment.SANDBOX;

// @desc    Get all token packages
// @route   GET /api/packages
// @access  Public
const getTokenPackages = async (req, res) => {
  try {
    const packages = await TokenPackage.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']]
    });
    res.json({
      success: true,
      packages
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { packageId } = req.body;
    const user = req.user;

    // Get package details
    const tokenPackage = await TokenPackage.findByPk(packageId);
    if (!tokenPackage) {
      return res.status(404).json({ message: 'Package not found' });
    }

    // Generate unique order ID
    const orderId = uuidv4();

    // Create payment record
    const payment = await Payment.create({
      user_id: user.id,
      token_package_id: packageId,
      order_id: orderId,
      amount: tokenPackage.price_amount,
      currency: tokenPackage.price_currency,
      tokens_purchased: tokenPackage.tokens,
      status: 'PENDING'
    });

    // Create Cashfree order
    const request = {
      order_amount: parseFloat(tokenPackage.price_amount),
      order_currency: tokenPackage.price_currency,
      order_id: orderId,
      customer_details: {
        customer_id: user.id.toString(),
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: req.body.phone || '9999999999'
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment-success?order_id={order_id}`,
        notify_url: `${process.env.FRONTEND_URL}/api/payments/webhook`
      }
    };

    const response = await Cashfree.PGCreateOrder('2023-08-01', request);

    res.json({
      success: true,
      paymentSessionId: response.data.payment_session_id,
      orderId,
      payment
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// @desc    Verify payment status
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find payment record
    const payment = await Payment.findOne({
      where: { order_id: orderId },
      include: [{ model: TokenPackage, as: 'tokenPackage' }]
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Get payment details from Cashfree
    const response = await Cashfree.PGOrderFetchPayments('2023-08-01', orderId);
    const paymentData = response.data[0];

    if (!paymentData) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status
    await payment.update({
      status: paymentData.payment_status,
      payment_id: paymentData.cf_payment_id,
      cashfree_response: paymentData,
      completed_at: paymentData.payment_status === 'SUCCESS' ? new Date() : null
    });

    if (paymentData.payment_status === 'SUCCESS') {
      // Add tokens to user account
      const user = await User.findByPk(payment.user_id);
      await user.addTokens(payment.tokens_purchased);
    }

    res.json({
      success: true,
      payment: {
        status: payment.status,
        tokensPurchased: payment.tokens_purchased,
        amount: payment.amount
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
};

// @desc    Get user payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { user_id: req.user.id },
      include: [{ model: TokenPackage, as: 'tokenPackage', attributes: ['name', 'tokens'] }],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cashfree webhook handler
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
  try {
    const { data } = req.body;

    if (data.payment_status === 'SUCCESS') {
      const payment = await Payment.findOne({
        where: { order_id: data.order.order_id, status: 'PENDING' }
      });

      if (payment) {
        await payment.update({
          status: 'SUCCESS',
          payment_id: data.cf_payment_id,
          cashfree_response: data,
          completed_at: new Date()
        });

        // Add tokens to user
        const user = await User.findByPk(payment.user_id);
        await user.addTokens(payment.tokens_purchased);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

module.exports = {
  getTokenPackages,
  createOrder,
  verifyPayment,
  getPaymentHistory,
  handleWebhook
};