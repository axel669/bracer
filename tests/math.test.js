// const math = require(
//     "./math.js"
// )
var math = _interopRequireWildcard(require("./math.js"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
