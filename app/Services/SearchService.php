<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Elasticsearch\Client;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class SearchService
{
    protected $elasticsearch;

    public function __construct(Client $elasticsearch)
    {
        $this->elasticsearch = $elasticsearch;
    }

    public function searchProducts(array $params): LengthAwarePaginator
    {
        $query = [
            'bool' => [
                'must' => [
                    ['match' => ['name' => $params['search'] ?? '']],
                ],
                'filter' => []
            ]
        ];

        // Add price range filter
        if (isset($params['min_price']) || isset($params['max_price'])) {
            $query['bool']['filter'][] = [
                'range' => [
                    'price' => [
                        'gte' => $params['min_price'] ?? null,
                        'lte' => $params['max_price'] ?? null
                    ]
                ]
            ];
        }

        // Add category filter
        if (isset($params['category'])) {
            $query['bool']['filter'][] = [
                'term' => ['category_id' => $params['category']]
            ];
        }

        $results = $this->elasticsearch->search([
            'index' => 'products',
            'body' => [
                'query' => $query,
                'sort' => [
                    ['_score' => ['order' => 'desc']],
                    ['created_at' => ['order' => 'desc']]
                ],
                'from' => ($params['page'] ?? 1) - 1,
                'size' => $params['per_page'] ?? 15
            ]
        ]);

        $hits = collect($results['hits']['hits']);
        $total = $results['hits']['total']['value'];

        $products = Product::findMany($hits->pluck('_id'));

        return new LengthAwarePaginator(
            $products,
            $total,
            $params['per_page'] ?? 15,
            $params['page'] ?? 1
        );
    }

    public function indexProduct(Product $product): void
    {
        $this->elasticsearch->index([
            'index' => 'products',
            'id' => $product->id,
            'body' => $this->buildProductDocument($product)
        ]);
    }

    private function buildProductDocument(Product $product): array
    {
        return [
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'category_id' => $product->category_id,
            'tags' => $product->tags->pluck('name'),
            'brand' => $product->brand->name ?? null,
            'stock' => $product->stock,
            'created_at' => $product->created_at->toIso8601String()
        ];
    }

    public function searchOrders(array $filters)
    {
        return Order::query()
            ->when($filters['search'] ?? null, function (Builder $query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($filters['status'] ?? null, function (Builder $query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['date_from'] ?? null, function (Builder $query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($filters['date_to'] ?? null, function (Builder $query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->with(['user', 'items.product'])
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }
} 