import { useEffect, useState } from "react";
import { useAuth } from "../context/UserContext";
import InputField from "../components/InputField";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import "../styles/RegistrationDetails.css";

const RegistrationDetails = () => {
  const navigate = useNavigate();
  const {
    user,
    completedSteps,
    updateCompletedSteps,
    profileStatus,
    updateProfileStatus,
  } = useAuth();
  const { triggerNotification } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Professional Details State
  const [educationDetails, setEducationDetails] = useState({
    license_number: "",
    qualification: "",
    specification: "",
    experience: "",
  });

  // Step 2: Documentation Details State
  const [documentation, setDocumentation] = useState({
    profile_pic: null,
    degree_certificate: null,
    resume: null,
    aadhar_number: "",
    aadhar_card_front: null,
    aadhar_card_back: null,
    pan_number: "",
    pan_card: null,
    signature: null,
    expertise: {
      careerCounsellor: false,
      psychologist: false,
      groupCounsellor: false,
    },
  });

  // Backend API endpoints
  const API_URL = import.meta.env.VITE_APP_API_ENDPOINT_URL;

  // Progress bar steps
  const steps = [
    { id: 1, title: "Professional Information" },
    { id: 2, title: "Documentation Profile" },
  ];

  // Calculate progress percentage
  const progressPercentage = (currentStep / steps.length) * 100;

  useEffect(() => {
    if (profileStatus === "approved") {
      navigate("/dashboard");
    } else if (completedSteps.includes(1)) {
      setCurrentStep(2);
    }
  }, [profileStatus, completedSteps, navigate]);

  // Navigation between steps
  const handleStepClick = (stepId) => {
    if (stepId <= currentStep) setCurrentStep(stepId);
  };

  // Centralized input handler
  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setState) => {
    const { name, files } = e.target;
    if (files?.[0]) {
      setState((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setDocumentation((prev) => ({
      ...prev,
      expertise: { ...prev.expertise, [name]: checked },
    }));
  };


  // Validation for Step 1
  const handleValidation = (e) => {
    e.preventDefault();
    const { license_number, qualification, specification, experience } = educationDetails;

    if (!license_number || !qualification || !specification || !experience) {
      triggerNotification("Please fill all required fields.", "error");
      return;
    }

    setCurrentStep(2);
  };

  // Step 1: Submit Professional Details
  const handleProfessionalSubmit = async (e) => {
    e.preventDefault();

    if (completedSteps.includes(1)) {
      triggerNotification("This details is already completed.", "error");
      return;
    }
    const user_id = user?.user_id;
    // console.log("User ID:", user_id);

    if (!user_id) {
      triggerNotification("User id  is missing. Please log in again.", "error");
      return;
    }

    const { license_number, qualification, specification, experience } =
      educationDetails;
    if (!license_number || !qualification || !specification || !experience) {
      triggerNotification("Please fill all required fields.", "error");
      return;
    }
    const payload = {
      user_id,
      license_number,
      qualification,
      specification,
      experience,
    };

    try {
      const response = await fetch(
        `${API_URL}/auth/upload-professional-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      console.log("Professional Response:", response);

      if (response.ok) {
        updateCompletedSteps(1);
        triggerNotification(
          "Professional details submitted successfully!",
          "success"
        );
        setCurrentStep(2);
      } else {
        const errorData = await response.json();
        console.error("Server Error:", errorData);
        triggerNotification(errorData.message, "error");
      }
    } catch (error) {
      console.error("Error submitting professional details:", error);
      triggerNotification("An unexpected error occurred.", "error");
    }
  };

  // Step 2: Submit Documentation Details
  const handleDocumentationSubmit = async (e) => {
    e.preventDefault();

    const user_id = user?.user_id || 123;

    if (!user_id) {
      triggerNotification(
        "User is not logged in. Please log in again.",
        "error"
      );
      return;
    }

    const {
      profile_pic,
      degree_certificate,
      resume,
      aadhar_number,
      aadhar_card_front,
      aadhar_card_back,
      pan_number,
      pan_card,
      signature,
      expertise,
    } = documentation;

    if (
      !profile_pic ||
      !degree_certificate ||
      !resume ||
      !aadhar_number ||
      !aadhar_card_front ||
      !aadhar_card_back ||
      !pan_number ||
      !pan_card ||
      !signature
    ) {
      triggerNotification(
        "Please fill all required fields and upload all documents.",
        "error"
      );
      return;
    }

    const formData = new FormData();
    formData.append("user_id", user_id);
    formData.append("profile_pic", profile_pic);
    formData.append("degree_certificate", degree_certificate);
    formData.append("resume", resume);
    formData.append("aadhar_number", aadhar_number);
    formData.append("aadhar_card_front", aadhar_card_front);
    formData.append("aadhar_card_back", aadhar_card_back);
    formData.append("pan_number", pan_number);
    formData.append("pan_card", pan_card);
    formData.append("signature", signature);
    formData.append("professional_expertise", JSON.stringify(expertise));

    try {
      const response = await fetch(`${API_URL}/auth/upload-documents`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        updateCompletedSteps(2);
        updateProfileStatus("waiting_approval"); // Update profile status
        triggerNotification("Documentation submitted successfully!", "success");
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        triggerNotification(errorData.message, "error");
      }
    } catch (error) {
      console.error("Error submitting documentation:", error);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    handleProfessionalSubmit(e);
    handleDocumentationSubmit(e);
  };
  return (
    <div className="reg-container">
      <div className="reg-form-wrapper">
        <h1 className="reg-form-title">Registration Details</h1>

        {/* Steps */}
        <div className="reg-steps-wrapper">
          <div className="reg-steps">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`reg-step ${step.id === currentStep
                  ? "reg-current"
                  : step.id < currentStep
                    ? "reg-completed"
                    : "reg-upcoming"
                  }`}
                onClick={() => handleStepClick(step.id)}
              >
                {step.title}
              </div>
            ))}
          </div>
          <div className="reg-progress-bar">
            <div
              className="reg-progress-indicator"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Professional Details */}
        {currentStep === 1 && (
          <form className="reg-form-grid">
            {/* license_number */}
            <InputField
              label="License Number *"
              name="license_number"
              placeholder="Enter License Number"
              value={educationDetails.license_number}
              handleChange={(e) => handleInputChange(e, setEducationDetails)}
            />
            {/* qualification */}
            <InputField
              label="Qualification *"
              name="qualification"
              placeholder="Enter Qualification"
              value={educationDetails.qualification}
              handleChange={(e) => handleInputChange(e, setEducationDetails)}
            />
            {/* specification */}
            <InputField
              label="Specification *"
              name="specification"
              placeholder="Enter Specification"
              value={educationDetails.specification}
              handleChange={(e) => handleInputChange(e, setEducationDetails)}
            />
            {/* experience */}
            <InputField
              label="Experience *"
              name="experience"
              placeholder="Enter Experience"
              value={educationDetails.experience}
              handleChange={(e) => handleInputChange(e, setEducationDetails)}
            />
            {/* NEXT BUTTON */}
            <div className="reg-form-action">
              <button
                type="button"
                className="reg-button"
                onClick={(e) => handleValidation(e)}
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Documentation Details */}
        {currentStep === 2 && (
          <form className="reg-form-grid">
            {/* profile_pic */}
            <InputField
              label="Upload Profile Picture *"
              name="profile_pic"
              type="file"
              handleChange={(e) => handleFileChange(e, setDocumentation)}
            />
            {/* degree_certificate */}
            <InputField
              label="Upload Degree Certificate *"
              name="degree_certificate"
              type="file"
              handleChange={(e) => handleFileChange(e, setDocumentation)}
            />
            {/* resume */}
            <InputField
              label="Upload Resume *"
              name="resume"
              type="file"
              handleChange={(e) => handleFileChange(e, setDocumentation)}
            />
            {/* aadhar_number */}
            <InputField
              label="Aadhar Number *"
              name="aadhar_number"
              placeholder="Enter Aadhar Number"
              value={documentation.aadhar_number}
              handleChange={(e) => handleInputChange(e, setDocumentation)}
            />
            {/* aadhar_card */}
            <InputField
              label="Upload Aadhar Card Front *"
              name="aadhar_card_front"
              type="file"
              handleChange={(e) => handleFileChange(e, setDocumentation)}
            />
            {/* aadhar_card_back */}
            <InputField
              label="Upload Aadhar Card Back *"
              name="aadhar_card_back"
              type="file"
              handleChange={(e) => handleFileChange(e, setDocumentation)}
            />
            {/* pan_number */}
            <InputField
              label="PAN Number *"
              name="pan_number"
              placeholder="Enter PAN Number"
              value={documentation.pan_number}
              handleChange={(e) => handleInputChange(e, setDocumentation)}
            />
            {/* pan_card */}
            <InputField
              label="Upload PAN Card *"
              name="pan_card"
              type="file"
              handleChange={(e) => handleFileChange(e, setDocumentation)}
            />
            {/* signature */}
            <InputField
              label="Upload Signature *"
              name="signature"
              type="file"
              handleChange={(e) => handleFileChange(e, setDocumentation)}
            />
            {/* Professional Expertise */}
            <div className="reg-expertise-section">
              <div className="reg-label-container">
                <label className="reg-label">
                  Professional Expertise *
                </label>
                <div className="reg-checkbox-container">
                  <label className="reg-checkbox-label">
                    <input
                      type="checkbox"
                      name="careerCounsellor"
                      checked={documentation.expertise.careerCounsellor}
                      onChange={handleCheckboxChange}
                    />
                    <span>Career Counsellor</span>
                  </label>
                  <label className="reg-checkbox-label">
                    <input
                      type="checkbox"
                      name="psychologist"
                      checked={documentation.expertise.psychologist}
                      onChange={handleCheckboxChange}
                    />
                    <span>Psychologist</span>
                  </label>
                  <label className="reg-checkbox-label">
                    <input
                      type="checkbox"
                      name="groupCounsellor"
                      checked={documentation.expertise.groupCounsellor}
                      onChange={handleCheckboxChange}
                    />
                    <span>Group Counsellor</span>
                  </label>
                </div>
              </div>
            </div>
            {/* BACK BUTTON AND SUBMIT */}
            <div className="reg-form-action">

              {/* Back Button */}
              <button
                type="button"
                className="reg-button-back"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </button>

              <button
                type="submit"
                className="reg-button"
                onClick={handleFinalSubmit}
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>

  );
};

export default RegistrationDetails;
