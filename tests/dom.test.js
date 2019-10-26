suite(
    "DOM tests",
    test(
        "basic",
        () => {
            console.log(document.body)
            expect(true).toBe(true)
        }
    )
)
