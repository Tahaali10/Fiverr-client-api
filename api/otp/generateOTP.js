export const generateOTP = () => {
    try {
        return `${Math.floor(10000 + Math.random() * 90000)}`;
    } catch (error) {
    throw error
    }
};
