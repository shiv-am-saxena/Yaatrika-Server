import crypto from 'crypto';
import Razorpay from 'razorpay';
import Ride from '../../models/ride.model.js';
import Payment from '../../models/payment.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import { apiResponse } from '../../utils/apiResponse.js';

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID!,
	key_secret: process.env.RAZORPAY_KEY_SECRET!
});

// ✅ CREATE ORDER
export const createRazorpayOrder = asyncHandler(async (req, res) => {
	const { rideId } = req.body;
	const userId = req.user?.user?._id;

	if (!rideId) throw new ApiError(400, 'rideId required');

	const ride = await Ride.findOne({ _id: rideId, user: userId });
	if (!ride) throw new ApiError(404, 'Ride not found');

	if (ride.status !== 'dropped') {
		throw new ApiError(409, 'Payment not allowed yet');
	}

	// prevent duplicate payment
	const existing = await Payment.findOne({
		ride: ride._id,
		status: 'paid'
	});
	if (existing) throw new ApiError(409, 'Already paid');

	const amount = Math.round(Number(ride.fare) * 100);

	const order = await razorpay.orders.create({
		amount,
		currency: 'INR',
		receipt: `ride_${ride._id}`,
		notes: { rideId: String(ride._id) }
	});

	await Payment.create({
		ride: ride._id,
		amount: ride.fare,
		method: 'razorpay',
		razorpay_order_id: order.id,
		status: 'pending'
	});

	res.json(
		new apiResponse(200, {
			key: process.env.RAZORPAY_KEY_ID,
			orderId: order.id,
			amount: order.amount,
			currency: order.currency
		})
	);
});

// ✅ VERIFY PAYMENT
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
	const { rideId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
		req.body;
	const userId = req.user?.user?._id;

	const ride = await Ride.findOne({ _id: rideId, user: userId });
	if (!ride) throw new ApiError(404, 'Ride not found');

	const expected = crypto
		.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
		.update(`${razorpay_order_id}|${razorpay_payment_id}`)
		.digest('hex');

	if (expected !== razorpay_signature) {
		throw new ApiError(400, 'Invalid signature');
	}

	const payment = await Payment.findOne({ razorpay_order_id });

	if (!payment) throw new ApiError(404, 'Payment not found');

	payment.status = 'paid';
	payment.razorpay_payment_id = razorpay_payment_id;
	payment.razorpay_signature = razorpay_signature;
	await payment.save();

	ride.status = 'completed';
	await ride.save();

	res.json(new apiResponse(200, { ride }, 'Payment successful'));
});
