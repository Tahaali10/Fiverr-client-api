import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config();

const transporter = nodemailer.createTransport({
//   service:"gmail",
host:"smtp.gmail.com",
port:465,
secure:true,
    auth: {
        user:"syedtahali10@gmail.com",
        pass:"tbsu fkon uowt nkkx",
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error)
    } else {
        console.log("Ready For Message");
        console.log(("Success"));
    }
})

export const sendEmail = async (mailOptions) => {
    try {
        await transporter.sendMail(mailOptions);
        return;
    }
    catch (error) {
      throw error
    }
}