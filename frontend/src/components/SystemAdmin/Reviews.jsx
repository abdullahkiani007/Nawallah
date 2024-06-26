import "../../styles/font/font.css";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore/lite";
import { firestore } from "../../firebase.config.jsx";
import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';

const UnauthorizedRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "restaurants_pending"));
        const restaurantList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRestaurants(restaurantList);
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
      }
    };

    fetchRestaurants();
  }, []);

  const handleAccept = async (id) => {
    try {
      const restaurantDocRef = doc(firestore, "restaurants_pending", id);
      const restaurantDocSnap = await getDoc(restaurantDocRef);
      if (restaurantDocSnap.exists()) {
        const restaurantData = restaurantDocSnap.data();

        // Move to restaurantAdmins collection
        await setDoc(doc(firestore, "restaurantAdmins", id), restaurantData);

        // Remove from restaurants_pending collection
        await deleteDoc(restaurantDocRef);

        console.log(`Accepted restaurant with ID: ${id}`);
        setRestaurants(prevRestaurants => prevRestaurants.filter(restaurant => restaurant.id !== id));
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error accepting restaurant: ", error);
    }
  };

  const handleReject = async (id) => {
    try {
      const restaurantDocRef = doc(firestore, "restaurants_pending", id);
      const restaurantDocSnap = await getDoc(restaurantDocRef);
      if (restaurantDocSnap.exists()) {
        const restaurantData = restaurantDocSnap.data();

        // Move to restaurants_rejected collection
        await setDoc(doc(firestore, "restaurants_rejected", id), restaurantData);

        // Remove from restaurants_pending collection
        await deleteDoc(restaurantDocRef);

        console.log(`Rejected restaurant with ID: ${id}`);
        setRestaurants(prevRestaurants => prevRestaurants.filter(restaurant => restaurant.id !== id));
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error rejecting restaurant: ", error);
    }
  };

  return (
    <div className='ml-[56px] mr-2 md:mx-6 sm:mx-3 sm:pl-4  mt-24 bg-white'>
      <div className="justify-between items-center w-full flex">
        <h1 className='selector text-costomFont text-3xl font-cursive my-7 font-bold'>Unauthorized Businesses</h1>
      </div>
      <div>
        <div className="overflow-x-auto bg-costomFont rounded-xl">
          <table className="w-full sm:w-full md:w-full md:overflow-x-scroll sm:overflow-x-scroll text-left text-gray-400">
            <thead className="text-lg text-center font-bold 2xl:text-lg selector text-[#E5E5E5] border-b border-grey-400">
              <tr className="">
                <th scope="col" className="pl-6 text-lg py-3">Logo</th>
                <th scope="col">Restaurant Name</th>
                <th scope="col">Email</th>
                <th scope="col">Address</th>
                <th scope="col">Phone No</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody className='text-white '>
              {restaurants.map((restaurant) => (
                <tr key={restaurant.id} className="border-b text-center text-[#E5E5E5]  text-lg selector font-normal ">
                  <td className=" py-4 pl-6 font-light text-lg 2xl:text-lg text-white whitespace-nowrap">
                    <img src={restaurant.logo} alt={`${restaurant.name} logo`} className="w-10 h-10 rounded-full" />
                  </td>
                  <td className="border border-grey-400">{restaurant.username}</td>
                  <td className="border border-grey-400">{restaurant.email}</td>
                  <td className="border border-grey-400">{restaurant.address}</td>
                  <td className="border border-grey-400">{restaurant.phone}</td>
                  <td className="border border-grey-400">
                    <div className='flex flex-row lg:pl-14 md:pl-1 sm:pl-1 lg:pr-0 md:pr-1 sm:pr-1 gap-3'>
                      <Button variant="contained" color="success" onClick={() => handleAccept(restaurant.id)}>Accept</Button>
                      <Button variant="contained" color="error" onClick={() => handleReject(restaurant.id)}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedRestaurants;
