const takeType = (array, ...types) => array.filter(
    item => types.indexOf(item.type) !== -1
)

export default takeType
