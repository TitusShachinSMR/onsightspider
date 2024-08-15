document.getElementById("pnr-form").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent form submission
  const pnrNumber = document.getElementById("pnrInput").value;
  const trainnumber = document.getElementById("trainname").value;
  console.log(pnrNumber);
  try {
    const url = `https://real-time-pnr-status-api-for-indian-railways.p.rapidapi.com/name/${pnrNumber}`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "c19bf57856msheef4ffcdc3ffd74p1c34dfjsndcf1a955670b",
        "x-rapidapi-host":
          "real-time-pnr-status-api-for-indian-railways.p.rapidapi.com",
      },
    };
    const response = await fetch(url, options);
    const result = await response.json();

    const resultContainer = document.getElementById("result");
    resultContainer.innerHTML = "";

    const trainElement = document.createElement("p");
    trainElement.textContent = `Train: ${result.trainNum} - ${result.trainName}`;
    resultContainer.appendChild(trainElement);

    const journeyElement = document.createElement("p");
    journeyElement.textContent = `Journey: From ${result.stationFrom} to ${result.stationTo} (Boarding at ${result.boardingPoint})`;
    resultContainer.appendChild(journeyElement);

    const datesElement = document.createElement("p");
    datesElement.textContent = `Departure: ${result.departureDate}, Arrival: ${result.arrivalDate}`;
    resultContainer.appendChild(datesElement);

    const classElement = document.createElement("p");
    classElement.textContent = `Class: ${result.journeyClass}`;
    resultContainer.appendChild(classElement);

    const chartElement = document.createElement("p");
    chartElement.textContent = `Chart Status: ${result.chartStts}`;
    resultContainer.appendChild(chartElement);

    const passengerList = document.createElement("ul");
    passengerList.textContent = "Passenger Details:";
    result.passengerDetailsDTO.forEach((passenger, index) => {
      const passengerElement = document.createElement("li");
      passengerElement.textContent = `Passenger ${index + 1}: ${
        passenger.displayName
      } (${passenger.gender}, Age: ${passenger.age}, Status: ${
        passenger.seatStts
      })`;
      passengerList.appendChild(passengerElement);
    });
    resultContainer.appendChild(passengerList);
  } catch (error) {
    console.error(error);
    document.getElementById("result").innerHTML = "Error fetching details.";
  }
  fetch("/trainname", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ trainnumber: trainnumber }),
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
});
