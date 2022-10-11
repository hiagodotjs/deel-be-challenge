function isValidDate(date) {
    const dateRegex = /^\d{4}\-\d{1,2}\-\d{1,2}$/
    return dateRegex.test(date);
}

module.exports = isValidDate;