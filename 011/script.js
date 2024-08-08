//005

const input = [
    { name: 'Product A', price: 100, quantity: 5, available: true },
    { name: 'Product B', price: 200, quantity: 0, available: false },
    { name: 'Product C', price: 150, quantity: 3, available: true },
    { name: 'Product D', price: 80, quantity: 2, available: true }
];

function solve(arr) {
    if (!arr || Object.keys(arr) == null) {
        return;
    }

    return arr.filter((val) => val.quantity >= 0 && val.available == true).sort((a, b) => b.price - a.price);
}

console.log(solve(input));