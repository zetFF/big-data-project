import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { loadStripe } from "@stripe/stripe-js";
import {
    CardElement,
    Elements,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.MIX_STRIPE_KEY);

function CheckoutForm({ order }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const { post } = useForm();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (!stripe || !elements) {
            return;
        }

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement),
        });

        if (error) {
            setError(error.message);
            setProcessing(false);
            return;
        }

        post(
            route("orders.pay", order.id),
            {
                payment_method: "stripe",
                payment_method_id: paymentMethod.id,
            },
            {
                onSuccess: () => {
                    window.location.href = route("orders.success", order.id);
                },
                onError: () => {
                    setError("Payment failed. Please try again.");
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: "16px",
                                color: "#424770",
                                "::placeholder": {
                                    color: "#aab7c4",
                                },
                            },
                            invalid: {
                                color: "#9e2146",
                            },
                        },
                    }}
                />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {processing ? "Processing..." : `Pay $${order.total_amount}`}
            </button>
        </form>
    );
}

export default function PaymentForm({ order }) {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm order={order} />
        </Elements>
    );
}
