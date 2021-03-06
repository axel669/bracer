const runAll = async (actions, ...args) => {
    for (const action of actions) {
        const f = action.run || action
        await f(...args)
    }
}

export default runAll
