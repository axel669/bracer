const subscriptions = {}

const bridge = {
    subscribe: (type, handler) => {
        const id = Math.random().toString(36)
        const listener = {
            id,
            dispatch: handler
        }
        const handlers = subscriptions[type] ?? []

        subscriptions[type] = [
            ...handlers,
            listener,
        ]

        return () => {
            subscriptions[type] = subscriptions[type].filter(
                listener => listener.id !== id
            )
        }
    },
    dispatch: (type, data) => {
        const listeners = subscriptions[type] ?? []
        for (const listener of listeners) {
            listener.dispatch(data, type)
        }
    },
}

module.exports = bridge
