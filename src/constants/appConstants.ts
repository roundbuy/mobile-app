const responseObject = {
    data: [
        {
          id: 4,
          image: require("../../assets/chair1.png"),
          title: "Luxury Chair",
          amount: "€140",
          distance: "8km",
          duration: `${8 * 15} minutes`, // 8 km * 15 minutes per km
          location: { latitude: 26.767679, longitude: 81.121336 }
        },
        {
          id: 5,
          image: require("../../assets/chair2.png"),
          title: "Wooden Chair",
          amount: "€45",
          distance: "12km",
          duration: `${12 * 15} minutes`, // 12 km * 15 minutes per km
          location: { latitude: 26.7153, longitude: 81.0674 }
        },
        {
          id: 6,
          image: require("../../assets/chair3.png"),
          title: "Office Chair",
          amount: "€85",
          distance: "3km",
          duration: `${3 * 15} minutes`, // 3 km * 15 minutes per km
          location: { latitude: 26.7153, longitude: 81.0674 }
        },
        {
          id: 7,
          image: require("../../assets/chair1.png"),
          title: "Gaming Chair",
          amount: "€125",
          distance: "7km",
          duration: `${7 * 15} minutes`, // 7 km * 15 minutes per km
          location: { latitude: 26.7153, longitude: 81.0674 }
        },
        {
          id: 8,
          image: require("../../assets/chair2.png"),
          title: "Dining Chair",
          amount: "€65",
          distance: "9km",
          duration: `${9 * 15} minutes`, // 9 km * 15 minutes per km
          location: { latitude: 26.7153, longitude: 81.0674 }
        },
        {
          id: 9,
          image: require("../../assets/chair3.png"),
          title: "Recliner Chair",
          amount: "€200",
          distance: "15km",
          duration: `${15 * 15} minutes`, // 15 km * 15 minutes per km
          location: { latitude: 26.7153, longitude: 81.0674 }
        }
      ],
    page: 1,
    totalPage: 3
  };

function getMarkers() {
  return responseObject.data.map(item => ({
    id: item.id,
    title: item.title,
    location: item.location
  }));
}

export {
    responseObject,
    getMarkers
}