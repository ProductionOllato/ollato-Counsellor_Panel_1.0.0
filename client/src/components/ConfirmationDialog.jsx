import React from 'react';
import {
    Typography,
    Dialog,
} from "@material-tailwind/react";


const ConfirmationDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    icon
}) => {
    return (
        <Dialog
            open={open}
            handler={onClose}
            className="bg-[#f5ded6] border shadow-lg p-4 py-4 sm:p-2 sm:py-4 h-fit w-fit sm:w-3/4 md:w-2/3 lg:w-1/2 max-w-lg sm:max-w-xl md:max-w-2xl fixed inset-0 m-auto z-50 flex items-center justify-center rounded-none"
        >
            <div className="flex flex-col items-center text-center">
                {/* {icon && <div className="mb-6">{icon}</div>} */}

                <Typography
                    variant="h4"
                    className="mb-6 text-gray-800 font-semibold text-lg sm:text-2xl"
                >
                    {title}
                </Typography>

                <Typography className="mb-4 text-gray-600 w-full max-w-xs"> {/* Fixed message size */}
                    {message}
                </Typography>

                <div className="flex flex-col justify-center gap-4 w-full"> {/* Changed to flex-col */}
                    <button
                        className="px-6 py-3 text-base font-semibold text-white bg-[#a5243d] hover:bg-[#771e39] w-full border-none"
                        onClick={onConfirm}
                    >
                        Yes, I'm sure
                    </button>
                    <button
                        className="px-6 py-3 text-lg font-semibold text-gray-700 bg-gray-300 hover:bg-gray-400 w-full border-none"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Dialog>

    );
};

export default ConfirmationDialog;