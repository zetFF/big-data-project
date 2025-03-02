<?php

namespace App\Services;

use App\Models\Order;
use App\Models\ShippingZone;
use App\Models\ShippingMethod;
use App\Models\ShippingRate;
use Illuminate\Support\Collection;

class ShippingCalculatorService
{
    public function calculateShippingOptions(Order $order, string $postalCode): Collection
    {
        $shippingZone = $this->determineShippingZone($postalCode);
        $totalWeight = $this->calculateTotalWeight($order);
        $dimensions = $this->calculatePackageDimensions($order);
        
        return ShippingMethod::where('is_active', true)
            ->get()
            ->map(function ($method) use ($order, $shippingZone, $totalWeight, $dimensions) {
                return [
                    'method_id' => $method->id,
                    'name' => $method->name,
                    'carrier' => $method->carrier,
                    'delivery_time' => $this->estimateDeliveryTime($method, $shippingZone),
                    'rate' => $this->calculateRate($method, $shippingZone, $totalWeight, $dimensions),
                    'tracking_available' => $method->tracking_available,
                    'restrictions' => $this->checkRestrictions($method, $order)
                ];
            })
            ->filter(fn($option) => $option['rate'] !== null);
    }

    private function determineShippingZone(string $postalCode): ShippingZone
    {
        return ShippingZone::whereRaw("? BETWEEN postal_code_start AND postal_code_end", [$postalCode])
            ->orWhere(function ($query) use ($postalCode) {
                $query->whereJsonContains('postal_codes', $postalCode);
            })
            ->firstOrFail();
    }

    private function calculateTotalWeight(Order $order): float
    {
        return $order->items->sum(function ($item) {
            return $item->product->weight * $item->quantity;
        });
    }

    private function calculatePackageDimensions(Order $order): array
    {
        $items = $order->items->map(function ($item) {
            return [
                'length' => $item->product->length,
                'width' => $item->product->width,
                'height' => $item->product->height,
                'quantity' => $item->quantity
            ];
        });

        // Complex packing algorithm
        $packed = $this->packItems($items);

        return [
            'length' => $packed['length'],
            'width' => $packed['width'],
            'height' => $packed['height'],
            'volume' => $packed['volume']
        ];
    }

    private function calculateRate(
        ShippingMethod $method,
        ShippingZone $zone,
        float $weight,
        array $dimensions
    ): ?float {
        $rate = ShippingRate::where('method_id', $method->id)
            ->where('zone_id', $zone->id)
            ->where('weight_from', '<=', $weight)
            ->where('weight_to', '>=', $weight)
            ->first();

        if (!$rate) {
            return null;
        }

        $baseRate = $rate->base_rate;

        // Apply dimensional weight if applicable
        $dimWeight = ($dimensions['length'] * $dimensions['width'] * $dimensions['height']) / 5000;
        $chargeableWeight = max($weight, $dimWeight);

        // Calculate additional charges
        $additionalCharges = $this->calculateAdditionalCharges($method, $zone, $chargeableWeight);

        // Apply zone-specific multiplier
        $zoneMultiplier = $zone->rate_multiplier;

        return ($baseRate + $additionalCharges) * $zoneMultiplier;
    }

    private function estimateDeliveryTime(ShippingMethod $method, ShippingZone $zone): array
    {
        $baseTime = $method->base_delivery_time;
        $zoneDelay = $zone->additional_delivery_days;

        return [
            'min_days' => $baseTime['min_days'] + $zoneDelay,
            'max_days' => $baseTime['max_days'] + $zoneDelay,
            'guaranteed' => $method->delivery_guarantee
        ];
    }

    private function checkRestrictions(ShippingMethod $method, Order $order): array
    {
        $restrictions = [];

        // Check weight restrictions
        if ($this->calculateTotalWeight($order) > $method->max_weight) {
            $restrictions[] = 'Exceeds maximum weight limit';
        }

        // Check destination restrictions
        if ($method->restricted_zones->contains($order->shipping_zone_id)) {
            $restrictions[] = 'Not available in your area';
        }

        // Check product-specific restrictions
        foreach ($order->items as $item) {
            if ($item->product->shipping_restrictions) {
                $restrictions = array_merge(
                    $restrictions,
                    $item->product->shipping_restrictions
                );
            }
        }

        return array_unique($restrictions);
    }

    private function packItems(Collection $items): array
    {
        // Implementation of 3D bin packing algorithm
        // This is a simplified version - you might want to use a specialized library
        $totalVolume = 0;
        $maxLength = 0;
        $maxWidth = 0;
        $maxHeight = 0;

        foreach ($items as $item) {
            $itemVolume = $item['length'] * $item['width'] * $item['height'] * $item['quantity'];
            $totalVolume += $itemVolume;

            $maxLength = max($maxLength, $item['length']);
            $maxWidth = max($maxWidth, $item['width']);
            $maxHeight = max($maxHeight, $item['height']);
        }

        return [
            'length' => $maxLength,
            'width' => $maxWidth,
            'height' => $maxHeight,
            'volume' => $totalVolume
        ];
    }
} 