// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(amount);
};

// Format date
export const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Format number
export const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
};
