

export async function fetchPopularMaps() {
  return [
    {
      id: "map1",
      title: "European Landmarks Tour",
      description:
        "A shared map of iconic landmarks across Europe with beautiful photo pins.",
      views: 3820,
    },
    {
      id: "map2",
      title: "National Parks Expedition",
      description:
        "Explore the best nature spots captured by hikers and travelers.",
      views: 2987,
    },
    {
      id: "map3",
      title: "Urban Adventures: NYC",
      description: "Geotagged memories from the heart of the Big Apple.",
      views: 2124,
    },
  ];
}

export async function fetchPopularLocations() {
  return [
    { id: "loc1", name: "Paris" },
    { id: "loc2", name: "Yosemite" },
    { id: "loc3", name: "Tokyo" },
    { id: "loc4", name: "Grand Canyon" },
    { id: "loc5", name: "Barcelona" },
  ];
}

export async function fetchTopUsers() {
  return [
    {
      id: "user1",
      name: "Sienna Rhodes",
      avatar: "https://i.pravatar.cc/150?img=32",
      mapsShared: 18,
    },
    {
      id: "user2",
      name: "Mateo Luna",
      avatar: "https://i.pravatar.cc/150?img=20",
      mapsShared: 14,
    },
    {
      id: "user3",
      name: "Harper Zhao",
      avatar: "https://i.pravatar.cc/150?img=10",
      mapsShared: 11,
    },
    {
      id: "user4",
      name: "Quinn Varela",
      avatar: "https://i.pravatar.cc/150?img=48",
      mapsShared: 9,
    },
  ];
}
