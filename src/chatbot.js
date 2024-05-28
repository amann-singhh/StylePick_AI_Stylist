import React, { useState } from 'react';
import ChatBot from "react-chatbotify";
import { getMetaAttributes, getVisionResponse } from './openai.js';
import './chatbot.css';


const MyChatBot = () => {
  const [form, setForm] = useState({});
  const [stylingTips, setStylingTips] = useState('');
  const [body_data, setbody_data] = useState('');

  const fetchStylingTips = async (form) => {
    const prompt = `
	"Body Shape: Apple, Skin Tone: Fair, Category/ Sub-category: Western/ Onepiece"

	Create a Fashion Styling tips for the given context with each metadata and justify it  with minimum token.
	
	Include these attributes and justify it.
	
	
	
	Length,  Pattern , Neck , Shape, Sleeve length,  Sleeve styling.`;
    console.log(prompt);
    try {
      const data = await getMetaAttributes(prompt);
      console.log(data);
      return data;
    } catch (error) {
      console.error('Error fetching styling tips:', error);
      throw error;
    }
  };

  const handleUpload = (params) => {
    const files = params.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, upload: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const formStyle = {
    marginTop: 10,
    marginLeft: 20,
    border: "1px solid red",
    padding: 10,
    borderRadius: 5,
    maxWidth: 300
  };

  const options = {
    isOpen: true,
    // ...other configurations
    theme: {
      primaryColor: '#ff0000',
      secondaryColor: '#ff0000',
      fontFamily: 'Arial, sans-serif',
    },
    audio: {
      disabled: false,
    },
    // ...other styles
  };

  const flow = {
    start: {
      message: "Hello there! What is your name?",
      function: (params) => setForm({ ...form, name: params.userInput }),
      path: "ask_age"
    },
    ask_age: {
      message: (params) => `Nice to meet you ${form.name}, what is your age?`,
      function: (params) => setForm({ ...form, age: params.userInput }),
      path: async (params) => {
        if (isNaN(Number(params.userInput))) {
          await params.injectMessage("Age needs to be a number!");
          return;
        }
        return "ask_gender";
      }
    },
    ask_gender: {
      message: "What's your gender?",
      options: ["Male", "Female"],
      chatDisabled: true,
      function: (params) => setForm({ ...form, gender: params.userInput }),
      path: "ask_height"
    },
    ask_height: {
      message: "What's your height (in centimeters)?",
      function: (params) => setForm({ ...form, height: params.userInput }),
      path: async (params) => {
        if (isNaN(Number(params.userInput))) {
          await params.injectMessage("Height needs to be a number!");
          return;
        }
        return "ask_weight";
      }
    },
    ask_weight: {
      message: "What's your weight?",
      function: (params) => setForm({ ...form, weight: params.userInput }),
      path: async (params) => {
        if (isNaN(Number(params.userInput))) {
          await params.injectMessage("Weight needs to be a number!");
          return;
        }
        return "ask_occasion";
      }
    },
    ask_occasion: {
      message: "Select occasions you are searching clothes for:",
      checkboxes: { items: ["Casual", "Daily", "Festive", "Formal", "Party"] },
      chatDisabled: true,
      function: (params) => setForm({ ...form, occasions: params.userInput }),
      path: "ask_attire"
    },
    ask_attire: {
      message: "Select attire you are searching for:",
      checkboxes: { items: ["Dress", "Top", "Bottom", "Kurta", "Sarees", "Skirts", "Jumpsuits", "Co-ord set"] },
      chatDisabled: true,
      function: (params) => setForm({ ...form, attires: params.userInput }),
      path: "upload_pic"
    },
    upload_pic: {
      message: "Please upload your full-length image.",
      chatDisabled: true,
      file: handleUpload,
      path: async () => {
		const body_data = await getVisionResponse("https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg");
        setbody_data(body_data);

        const data = await fetchStylingTips(form);
        setStylingTips(data);
        return "end";
      }
    },
    end: {
      message: "Thank you for your interest, here are your styling tips:",
      render: (
        <div style={formStyle}>
          <p>Name: {form.name}</p>
          <p>Age: {form.age}</p>
          <p>Gender: {form.gender}</p>
          <p>Height: {form.height}</p>
          <p>Weight: {form.weight}</p>
          <p>Occasion: {form.occasions}</p>
          <p>Attire: {form.attires}</p>
          {form.upload && <img src={form.upload} alt="uploaded" style={{ width: '30%' }} />}
          <p>Body data: {body_data}</p>
          <p>Styling Tips: {stylingTips}</p>
        </div>
      ),
      options: ["New Application"],
      chatDisabled: true,
      path: "start"
    },
  };

  return (
    <div className='chatbot-container'>
      <ChatBot options={{ theme: options.theme , chatHistory: { storageKey: "example_basic_form" } }} flow={flow} />
    </div>
  );
};

export default MyChatBot;
