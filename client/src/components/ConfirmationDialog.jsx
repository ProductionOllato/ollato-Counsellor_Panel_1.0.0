// ConfirmationDialog.jsx
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
            className="bg-[#f7d8e3] border shadow-lg p-6 sm:p-8 h-fit w-full sm:w-3/4 md:w-2/3 lg:w-1/2 max-w-lg sm:max-w-xl md:max-w-2xl fixed inset-0 m-auto z-50 flex items-center justify-center"
        >
            <div className="flex flex-col items-center text-center">
                {icon && <div className="mb-6">{icon}</div>}

                <Typography
                    variant="h4"
                    className="mb-6 text-gray-800 font-semibold text-lg sm:text-2xl"
                >
                    {title}
                </Typography>

                <Typography className="mb-4 text-gray-600">
                    {message}
                </Typography>

                <div className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto">
                    <button
                        className="px-6 py-3 text-base font-semibold text-white bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                    <button
                        className="px-6 py-3 text-lg font-semibold text-gray-700 bg-gray-300 hover:bg-gray-400 w-full sm:w-auto"
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