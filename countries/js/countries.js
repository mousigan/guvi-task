async function getData() {
    try{
        var resp = await fetch('https://restcountries.com/v3.1/all?fields=name,flags')
        const data=await resp.json();
        console.log(data);

        const displayCard = data.map(data => 
            `<div class="country">
                <div class="img-box">
                <img src="${data.flags.png}" alt=>
                </div>
                <h3>${data.name.common}</h3>
            </div>`
        ).join("");

        document.querySelector('.countries-card').innerHTML = displayCard;
    }catch(error){
        console.error(error);
    }
    
}

getData();




