async function searchTrains() {
    const fromStation = document.getElementById('fromStation').value;
    const toStation = document.getElementById('toStation').value;
    const date = document.getElementById('date')
    
    const url = `http://localhost:4000/api/trains?from=${fromStation}&to=${toStation}&train_date=26-05-2023
`;
    
    const options = {
        method: 'GET',
        // headers: {
        //     'x-rapidapi-key': '9a7ce72e6bmshda7c80edc89b9f3p18ff3bjsn6b7542100693',
        //     'x-rapidapi-host': 'irctc1.p.rapidapi.com'
        // }
    };
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        console.log(date.value)
        document.getElementById('result').textContent = JSON.stringify(result);
        console.log(JSON.stringify(result))
    } catch (error) {
        document.getElementById('result').textContent = 'Error fetching train data';
        console.error(error);
    }
}