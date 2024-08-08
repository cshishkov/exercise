//003

const input = [
    { name: 'Laptop', price: 1200, category: 'Electronics' },
    { name: 'Smartphone', price: 800, category: 'Electronics' },
    { name: 'Jeans', price: 50, category: 'Clothing' },
    { name: 'T-shirt', price: 20, category: 'Clothing' },
    { name: 'Book', price: 25, category: 'Books' }
];

function solve(arr) {
    if (!arr || Object.keys(arr) == null) {
        return;
    }

    return Object.groupBy(arr, ({ category }) => category);
}

console.log(solve(input));
