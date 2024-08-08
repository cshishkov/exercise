//004

const input = 14;

let steps = 0;
function solve(arg) {
    if (arg <= 0) {
        return;
    }

    if (arg % 2 == 0) {
        steps++;
        solve(arg / 2);
    } else {
        steps++;
        solve(arg - 1);
    }

    return steps;
}

console.log(solve(input));
