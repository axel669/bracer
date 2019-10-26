const pipe = (...funcs) =>
    initialValue => funcs.reduce(
        (current, nextFunc) => nextFunc(current),
        initialValue
    )
pipe.value = (value, ...funcs) => pipe(...funcs)(value)

const compose = (...funcs) =>
    initialValue => funcs.reduceRight(
        (current, nextFunc) => nextFunc(current),
        initialValue
    )
compose.value = (value, ...funcs) => compose(...funcs)(value)

const squareNums = nums => nums.map(i => i ** 2)
const describeNums = nums => nums.map(i => [i, i % 2])
const groupNames = ["even", "odd"]
const groupNums = nums => nums.reduce(
    (groups, numInfo) => {
        const [num, group] = numInfo
        const groupName = groupNames[group]

        const current = groups[groupName] || []
        groups[groupName] = [
            ...current,
            num,
        ]

        return groups
    },
    {}
)
const pipeData = pipe(
    squareNums,
    describeNums,
    groupNums
)
const composeData = compose(
    groupNums,
    describeNums,
    squareNums
)

const data = [1, 2, 3, 4, 5, 6, 7, 8, 9]

console.log(
    pipeData(data)
)
console.log(
    composeData(data)
)
