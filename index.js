const inquirer = require("inquirer");
const axios = require("axios");
const fs = require("fs");
const license = require("./licenses.js");
const LICENSES = {
  None: license.none,
  "Apache License 2.0": license.apacheLicense2_0,
  "GNU General Public License v3.0": license.gnu_GeneralPublicLicenseV3_0,
  "MIT License": license.mitLicense,
  'BSD 2-Clause "Simplified" License': license.bsd2_ClauseSimplifiedLicense,
  'BSD 3-Clause "New" or "Revised" License': license.bsd3_ClauseSimplifiedLicense,
  "Creative Commons Zero v1.0 Universal": license.creativeCommonsZeroV1_0Universal,
  "Eclipse Public License 2.0": license.eclipsePublicLicense2_0,
  "GNU Affero General Public License v3.0": license.gnuAfferoGeneralPublicLicenseV3_0,
  "GNU General Public License v2.0": license.gnuGeneralPublicLicenseV2_0,
  "GNU Lesser General Public License v2.1": license.gnuLesserGeneralPublicLicenseV3_0,
  "GNU Lesser General Public License v3.0": license.gnuLesserGeneralPublicLicenseV3_0,
  "Mozilla Public License 2.0": license.mozillaPublicLicense2_0,
  "The Unlicense": license.theUnlicense,
};

const MIN_DESCRIPTION_LENGTH = 20;
const EMAIL_REGEX1 = "/^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$/";
let gitHubUserName = null;
let email = null;
let fullName = null;
let projectName = null;
let projectUrl = null;
let projectDescription = null;
let questions = [
  {
    type: "input",
    message: "What is your Github username?",
    name: "gitHubUsername",
    validate: async function checkGitHub(name) {
      try {
        const { data } = await axios.get(`https://api.github.com/users/${name}`);
        if (data != null) {
          console.log(data);
          fullName = data.name;
          email = data.email;
          gitHubUserName = data.login;
          return true;
        } else return `\n\nUnable to find GiitHub user "${name}"`;
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
    default: function getProjectEmail() {
      return email;
    },
    validate: validateEmail,
  },
  {
    type: "input",
    name: "projectName",
    message: "What is the name of your project?",
    validate: async function validateProjectName(name) {
      let errorText = null;
      console.clear();
      if (name == null || name.trim().length == 0) {
        console.log("Invalid project name");
        errorText = "Invalid project name";
      } else {
        let projName = name.trim();
        name = name.trim().toLowerCase();
        try {
          // use this to list all public repos
          // let repoUrl = `https://api.github.com/users/${gitHubUserName}/repos?per_page=100`;
          let repoUrl = `https://api.github.com/repos/${gitHubUserName}/${name}`;
          const { data } = await axios.get(repoUrl);
          if (data != null) {
            console.clear();
            console.log(data);
            // go through data array and look for the project name
            // for (let index = 0; index < data.length; index++) {
            //   if (data[index].name.toLowerCase() == name) {
            //     projectName = data[index].name;
            //     projectUrl = data[index].html_url;
            //     projectDescription = data[index].description;
            //     break;
            //   }
            // }
            // if (projectName == null) errorText = `Unable to find PUBLIC repo "${projName}"`;
            projectName = data.name;
            projectUrl = data.html_url;
            projectDescription = data.description;
          } else errorText = `Project name ${projName} is not a valid PUBLIC repo for this user`;
        } catch (err) {
          errorText = `\n\nUnable to find GitHub user "${name}"`;
          console.log(errorText);
        }
      }
      return errorText || true;
    },
  },
  {
    type: "input",
    name: "description",
    message: `Enter a brief description of your project (${MIN_DESCRIPTION_LENGTH} chars min)`,
    default: function getProjectDescription() {
      return projectDescription;
    },
    validate: validateDescription,
  },
  {
    type: "input",
    name: "projectUrl",
    message: "Enter your project URL",
    default: function getProjectUrl() {
      return projectUrl;
    },
  },
  {
    type: "list",
    name: "license",
    message: "Select your projects License type",
    choices: Object.keys(LICENSES),
    default: function getDefaultLicense() {
      return Object.keys(LICENSES)[0];
    },
  },
  {
    type: "input",
    name: "installCmd",
    message: "What command(s) should be run to install deependencies?",
    default: "npm install",
  },
  {
    type: "input",
    name: "testCmd",
    message: "Enter test command",
    default: "npm test",
  },
  // {
  //   type: "",
  //   name: "",
  //   message: "",
  // },
  // {
  //   type: "",
  //   name: "",
  //   message: "",
  // },
];
console.clear();
inquirer.prompt(questions).then((data) => {
  console.log(data);
  writeReadmeFile(data);
});

function validateEmail(email) {
  console.log(email);
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  console.log(`You have entered an invalid email address!(${email})`);
  return false;
}

function validateDescription(description) {
  if (description == null || description.trim().length < MIN_DESCRIPTION_LENGTH)
    return "Project description must be 50 characters or more";
  else {
    return true;
  }
}

function writeReadmeFile(data){
  console.log(`Data  GitHubUser: ${data.gitHubUsername}`);
  console.log(`Global GitHubUser: ${gitHubUserName}`);
  console.log(`Data  Email: ${data.}`);
  console.log(`Global Email: ${email}`);
  console.log(`Data  Project Name: ${data.}`);
  console.log(`Global Project Name: ${}`);
  console.log(`Data  : ${data.}`);
  console.log(`Global Project URL: ${}`);
  console.log(`Data  : ${data.}`);
  console.log(`Global Project Description: ${}`);
  console.log(`Data  : ${data.}`);
  console.log(`Global : ${}`);
  console.log(`Data  : ${data.}`);
  console.log(`Global : ${}`);
}