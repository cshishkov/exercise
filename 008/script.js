//002

const input = [2, -5, 10, -3, 7];


//v1
function solve(arr) {
    if (!arr || arr.length <= 0) {
        return;
    }

    const filtered = arr.filter((val) => val >= 0);
    return filtered.reduce((val1, val2) => val1 + val2) / filtered.length;
}

//v2
// function solveV2(arr) {
//     if (!arr || arr.length <= 0) {
//         return;
//     }

//     return arr
//         .filter((num) => num > 0)
//         .reduce((acc, num, _, { length }) => acc + num / length, 0);
// }


console.log(solve(input));
//console.log(solveV2(input));
