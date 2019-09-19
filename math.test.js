const math = require("./math.js")

const source = [1, 2, 3, 4, 5, 6]
const sum = math.sum(source)
const avg = math.avg(source)
const avgOfAvg = math.avg([
    math.avg([1, 2]),
    math.avg([3, 4]),
    math.avg([5, 6]),
])
const sumOfSum = math.sum([
    math.sum([1, 2]),
    math.sum([3, 4]),
    math.sum([5, 6]),
])

const cases = [
    1,
    2,
    3,
    4,
]

suite(
    "stats",
    setup(
        env => {
            env.test = 100
        }
    ),
    testCases(
        "Test Cases?",
        cases,
        testCase => {
            expect(testCase)
                .toBeBetween(2, 5)
        }
    ),
    suite(
        "avg",
        setup(
            env => {
                env.test = Math.E
            }
        ),
        test(
            "basic",
            (spec) => {
                spec.env.test = Math.PI
                expect(avg)
                    .toBe(3.5)
            }
        ),
        test(
            "of avg",
            (spec) => {
                expect(spec.env.test)
                    .toBeNear(Math.E)
                expect(avgOfAvg)
                    .toBe(avg)
            }
        )
    ),
    suite(
        "sum",
        test(
            "basic",
            (spec) => {
                expect(spec.env.test)
                    .not.toBeUndefined()
                expect(sum)
                    .toBe(21)
            }
        ),
        test(
            "of sum",
            () => {
                expect(sumOfSum)
                    .toBe(sum)
            }
        )
    ),
    test(
        "environment?",
        (spec) => {
            expect(spec.env.test)
                .toBe(100)
        }
    ),
)
