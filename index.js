const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");

const LICENSES = {
  None: none,
  "Apache License 2.0": apacheLicense2_0,
  "GNU General Public License v3.0": gnu_GeneralPublicLicenseV3_0,
  "MIT License": mitLicense,
  'BSD 2-Clause "Simplified" License': bsd2_ClauseSimplifiedLicense,
  'BSD 3-Clause "New" or "Revised" License': bsd3_ClauseSimplifiedLicense,
  "Creative Commons Zero v1.0 Universal": creativeCommonsZeroV1_0Universal,
  "Eclipse Public License 2.0": eclipsePublicLicense2_0,
  "GNU Affero General Public License v3.0": gnuAfferoGeneralPublicLicenseV3_0,
  "GNU General Public License v2.0": gnuGeneralPublicLicenseV2_0,
  "GNU Lesser General Public License v2.1": gnuLesserGeneralPublicLicenseV3_0,
  "GNU Lesser General Public License v3.0": gnuLesserGeneralPublicLicenseV3_0,
  "Mozilla Public License 2.0": mozillaPublicLicense2_0,
  "The Unlicense": theUnlicense,
};

const EMAIL_REGEX1 = "/^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$/";
let gitHubUserName = null;
let email = null;
let fullName = null;

let question1 = [
  {
    type: "input",
    message: "What is your Github username?",
    name: "gitHubusername",
    validate: async function checkGitHub(name) {
      try {
        const { data } = await axios.get(`https://api.github.com/users/${name}`);
        if (data != null) {
          console.log(data);
          fullName = data.name;
          email = data.email;
          return true;
        } else return false;
      } catch (err) {
        console.log(`\n\nUnable to find GitHub user "${name}"`);
        return false;
      }
    },
  },
  {
    type: "input",
    name: "email",
    message: "What is your email address?",
    default: email || "",
    validate: validateEmail,
  },
  {
    type: "input",
    name: "projectName",
    messaage: "What is the name of your project?",
  },
  {
    type: "input",
    name: "description",
    messaage: "Enter a brief description of your project (50 chars min)",
    validate: validateDescription,
  },
  {
    type: "input",
    name: "Project URL",
    messaage: "Enter your project URL",
  },
  {
    type: "list",
    name: "license",
    messaage: "Select your projects License type",
    choices: Object.keys(LICENSES),
    default: Object.keys(LICENSES)[0],
  },
  {
    type: "input",
    name: "installCmd",
    messaage: "What command(s) should be run to install deependencies?",
    default: "npm install",
  },
  {
    type: "input",
    name: "testCmd",
    messaage: "Enter test command",
    default: "npm test",
  },
  {
    type: "",
    name: "",
    messaage: "",
  },
  {
    type: "",
    name: "",
    messaage: "",
  },
];

inquirer.prompt(question1);

function validateEmail(email) {
  console.log(email);
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  console.log(`You have entered an invalid email address!(${email})`);
  return false;
}

function validateDescription(description) {
  if (description == null || description.trim().length < 50) return "Project description must be 50 characters or more";
  else {
    return true;
  }
}
