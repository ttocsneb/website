import Cookies from 'js-cookie' 


async function getQoteOfDay() {
    const api_url = "https://quotes.rest/qod?language=en";
    let response = await fetch(api_url, {
        headers: {
            accept: 'application/json'
        }
    });

    let data = await response.json();
    console.log(data);
    return data.contents.quotes[0];
}

function setQuoteOfDay(quote) {
    console.log(quote);

    let el = document.getElementById("qod");
    if (quote.author) {
        el.innerHTML = `${quote.quote}&mdash;${quote.author}`;
    } else {
        el.innerHTML = quote.quote;
    }
    el.classList.remove('d-none');
}

let lastQuote = Cookies.get("quote_of_day");
if (lastQuote === undefined) {
    getQoteOfDay().then(data => {
        let date = new Date(data.date);
        let nextDay = new Date(date.getTime() + 24 * 3600000);

        // Set the quote of the day cookie with an expiration of the next day at midnight
        Cookies.set("quote_of_day", JSON.stringify(data), {
            expires: nextDay
        });
        setQuoteOfDay(data);
    });
} else {
    setQuoteOfDay(JSON.parse(lastQuote));
}

