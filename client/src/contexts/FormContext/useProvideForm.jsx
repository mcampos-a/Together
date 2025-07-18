import { useState } from "react";
import DataService from "../../services/dataService.js";
import { useEventsContext } from "../EventsContext";

const useProvideForm = () => {
  const { addEvents, cache } = useEventsContext();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = ["Description", "Schedule", "Confirm", "Success"];

  const [formData, setFormData] = useState({
    recurring: { rate: "noRecurr", days: [] },
  });

  // form errors
  const [formCreateEventErrors, setFormCreateEventErrors] = useState([]);
  const [formScheduleEventErrors, setFormScheduleEventErrors] = useState([]);

  const handleNewStep = async (direction) => {
    const newStep = direction === "next" ? currentStep + 1 : currentStep - 1;

    if (newStep > 0 && newStep <= totalSteps.length) {
      setCurrentStep(newStep);
    }

    // Submit form to server
    if (newStep === 4) {
      // User timezone
      const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
      // Event data to be sent to the backend
      const event = { ...formData, timeZone };

      let response;
      try {
        // Axios automatically serializes object to JSON
        // https://masteringjs.io/tutorials/axios/post-json
        response = await DataService.create(event);
      } catch (err) {
        console.error(err);
        return;
      }

      const events = response.data.events;
      addEvents(
        events.filter((e) => {
          const s = new Date(e.startAt);
          const month = s.getMonth();
          const year = s.getFullYear();
          return cache.current.includes(new Date(year, month).getTime());
        })
      );
    }
  };

  return {
    currentStep,
    totalSteps,
    formData,
    formCreateEventErrors,
    formScheduleEventErrors,
    handleNewStep,
    setFormData,
    setFormCreateEventErrors,
    setFormScheduleEventErrors,
    setCurrentStep,
  };
};

export default useProvideForm;
