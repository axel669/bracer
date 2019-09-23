const sum = nums => nums.reduce(
    (total, n) => total + n,
    0
)
const avg = nums => (
    sum(nums)
    / nums.length
)

console.log(wat)

module.exports = {
    sum,
    avg,
}
