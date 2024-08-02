exports.handler = async (event, context) => {
    const date = new Date();
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'testing api',
            date: date.toISOString()
        })
    }
}