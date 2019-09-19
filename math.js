const sum = nums => nums.reduce(
    (total, n) => total + n,
    0
)
const avg = nums => (
    sum(nums)
    / nums.length
)

module.exports = {
    sum,
    avg,
}
