const originForm=document.getElementsByClassName("origin-form")[0];
const dstForm=document.getElementsByClassName("destination-form")[0];
const planButton=document.querySelector("button");
const originsUl=document.getElementsByClassName("origins")[0];
const dstUl=document.getElementsByClassName("destinations")[0];
const myTrip=document.querySelector("ul.my-trip");

let proximityPosition =[];
let originLocation=[];
let destinationLocation=[];


navigator.geolocation.getCurrentPosition((position)=>{
    const { latitude, longitude } = position.coords;
    const currentPosition=[longitude, latitude];
    proximityPosition=currentPosition;
    //console.log(proximityPosition)
});


const getSearchResults=async(keyWord,proximityPosition)=>{
    //console.log(proximityPosition)
    const URL="https://api.mapbox.com/geocoding/v5/mapbox.places/"+keyWord+".json?proximity="+proximityPosition[0]+","+proximityPosition[1]+"&bbox=-97.325875,49.766204,-96.953987,49.99275&access_token=pk.eyJ1IjoiY2h5bGVuZyIsImEiOiJja3A1ano1b3kxd3Z6Mm9tdzg3MGJud2xmIn0.GF5aouiF52eVjjE_2icciw&limit=999"
    const response=await fetch(URL);
    const data=await response.json();
    return data;
}


const renderUl=async (data,UL)=>{
    UL.innerHTML="";
    data.features.forEach(element=>{
        UL.insertAdjacentHTML("beforeend",`
        <li data-long="${element.center[0]}" data-lat="${element.center[1]}">
          <div class="name">${element.text}</div>
          <div>${element.properties.address}</div>
        </li>
        `)
    })
}

const getTransitData=async(origin, destination)=>{
    const URL="https://api.winnipegtransit.com/v3/trip-planner.json?api-key=MmuSYe7RjFYXEMtAmUXW&origin=geo/"+origin[0].dataset.lat+","+origin[0].dataset.long+"&destination=geo/"+destination[0].dataset.lat+","+destination[0].dataset.long;
    const response = await fetch(URL);
    const data = await response.json();
    if (response.status != 200){
        throw new err ("Can't get data");
    }

    return data;
}

const renderTrip=async(data)=>{
    myTrip.innerHTML="";
    //console.log(data.plans[0].segments[4].to.destination)
    data.plans[0].segments.forEach(segment=>{
        if(data.plans[0].segments.indexOf(segment)===data.plans[0].segments.length-1){
            myTrip.insertAdjacentHTML("beforeend",`
            <li>
                <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${segment.times.durations.total} minutes to
            your destination.
            </li>
            `)
        }else{
            switch(segment.type){
                case "walk":
                    myTrip.insertAdjacentHTML("beforeend",`
                    <li>
                        <i class="fas fa-walking" aria-hidden="true"></i>Walk for ${segment.times.durations.total} minutes
                    to stop #${segment.to.stop.key} - ${segment.to.stop.name}
                    </li>
                    `);
                    break;
                
                case "ride":
                    myTrip.insertAdjacentHTML("beforeend",`
                    <li>
                        <i class="fas fa-bus" aria-hidden="true"></i>Ride the Route ${segment.route.number}
                        ${segment.route.name} for ${segment.times.durations.total} minutes.
                    </li>
                    `);
                    break;

                case "transfer":
                    myTrip.insertAdjacentHTML("beforeend",`
                    <li>
                        <i class="fas fa-ticket-alt" aria-hidden="true"></i>Transfer from stop
                    #${segment.from.stop.key} - ${segment.from.stop.name} to stop #${segment.to.stop.key} - ${segment.to.stop.name}
                    </li>
                    `);
                    break;
            }
        }
    })
}

const displayPlan=async()=>{
    const selectedOrigin=document.querySelector("ul.origins").getElementsByClassName("selected");
    const selectedDestination=document.querySelector("ul.destinations").getElementsByClassName("selected")
    
    myTrip.innerHTML="";
    if(selectedOrigin.length>1||selectedDestination.length>1){
        myTrip.insertAdjacentHTML("afterbegin",`
            <p>Only one origin with one destination is accepted</p>
        `)
    }else{
        getTransitData(selectedOrigin, selectedDestination).then((data)=>renderTrip(data)).catch((err)=>console.log(err));
    }


}



//events

originForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const keyWord=e.target.elements.search.value;
    getSearchResults(keyWord,proximityPosition).then((data)=>{
        renderUl(data, originsUl);

    }).catch((err)=>console.log(err))
})

dstForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const keyWord=e.target.elements.search.value;
    getSearchResults(keyWord,proximityPosition).then((data)=>{
        renderUl(data, dstUl);

    }).catch((err)=>console.log(err))
})


originsUl.addEventListener('click', (e)=>{
    // let selectedLi=document.getElementsByClassName('selected');
    // if (selectedLi.length!=0){
    //     for(let element of selectedLi){
    //         if(element.parentElement.classList.contains('origins')){
    //             element.classList.remove('selected');
    //         }
    //     }
    // }
    if(e.target.nodeName==="LI"){
        const long=e.target.dataset.long;
        const lat=e.target.dataset.lat;
        e.target.classList.toggle("selected");
        // originLocation=[long,lat];
        // console.log(originLocation)
    }else if (e.target.parentElement.nodeName==="LI"){
        const long=e.target.parentElement.dataset.long;
        const lat=e.target.parentElement.dataset.lat;
        e.target.parentElement.classList.toggle("selected");
        // originLocation=[lat,long];
        // console.log(originLocation)
    }

})

dstUl.addEventListener('click', (e)=>{
    // let selectedLi=document.getElementsByClassName('selected');
    // if (selectedLi.length!=0){
    //     for(let element of selectedLi){
    //         if(element.parentElement.classList.contains('destinations')){
    //             element.classList.remove('selected');
    //         }
    //     }
    // }
    if(e.target.nodeName==="LI"){
        const long=e.target.dataset.long;
        const lat=e.target.dataset.lat;
        e.target.classList.toggle("selected");
        // destinationLocation=[long,lat];
        // console.log(destinationLocation)
    }else if (e.target.parentElement.nodeName==="LI"){
        const long=e.target.parentElement.dataset.long;
        const lat=e.target.parentElement.dataset.lat;
        e.target.parentElement.classList.toggle("selected");
        // destinationLocation=[lat,long];
        // console.log(destinationLocation)
    }

})

planButton.addEventListener('click',(e)=>{
    e.preventDefault();
    displayPlan();

})