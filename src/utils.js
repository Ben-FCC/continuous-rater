// ************************************************
// THIS PAGE REQUIRES EXPERIMENTER INPUT
// ************************************************

// don't change these import statements
import { initializeApp } from "firebase/app";
import { getFirestore, Timestamp } from "firebase/firestore";
// —— DEBUG: Monkey‐patch Firestore doc() to log all path segments —— //
import * as _fs from "firebase/firestore";
const _origDoc = _fs.doc;
_fs.doc = function(db, ...pathSegments) {
  console.log("[DEBUG doc()] called with segments:", pathSegments);
  return _origDoc(db, ...pathSegments);
};
// —— end debug patch —— //
import { getAuth } from "firebase/auth";
import { getPerformance } from "firebase/performance";
import { getAnalytics } from "firebase/analytics";
import { writable } from 'svelte/store';

// ************************************************
// ************************************************
// ************************************************
// ************************************************
// USER VARIABLES (FILL STUFF IN BELOW THIS LINE)
// ************************************************
// ************************************************
// ************************************************
// ************************************************

// lab variables
export const studyLocation = 'Taiwan'; // location of lab running mturk study
export const labName = 'CHENLab'; // name of lab running HIT experiment 
export const email = 'z56435678@gmail.com'; // lab email for mturk
export const studyAim = ''; // aim of mturk study 
export const studyTasks = ''; // brief summary of HIT task for consent form
export const experiment = 'Test'; // name of experiment (should match collection name in firebase)

// HIT variables
export const HITPay = '170'; // pay for HIT completion (format as X.XX with no dollar sign)
export const userGroup = 'Demo'; // name of collection of participants for current HIT
export const estHITTime = '60'; // estimated time to complete HIT (in minutes)
export const totalHITTime = estHITTime * 2; // total time provided for HIT (in minutes)

// stimuli variables      
export const ratingTypes = ['happy', 'sad', 'anger']; // array of rating types   

// this configures path to proper firebase
// COPY AND PASTE YOUR FIREBASE CONFIG HERE
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let firebaseConfig = {
  apiKey: "AIzaSyAG4Gu_EzW_i7MtY8ti6tGI9CT9o41Ig_Y",
  authDomain: "chenlab-continuousrating.firebaseapp.com",
  projectId: "chenlab-continuousrating",
  storageBucket: "chenlab-continuousrating.firebasestorage.app",
  messagingSenderId: "227911355447",
  appId: "1:227911355447:web:26f24334bc8ebe882843b2",
  measurementId: "G-S3YVD2BM8J"
};

// ************************************************
// ************************************************
// ************************************************
// ************************************************
// STOP. DON'T CHANGE ANYTHING BELOW THIS LINE
// ************************************************
// ************************************************
// ************************************************
// ************************************************

// dev is referenced as a store elsewhere in the code, so cannot be a simple Boolean
const DEV_MODE = true;
export const dev = writable(DEV_MODE);

// firebase info (export for use elsewhere in app)
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const perf = getPerformance(app);
export const analytics = getAnalytics(app);
export const serverTime = Timestamp.now();

// Functions to parse the URL to get workerID, hitID, and assignmentID
const unescapeURL = (s) => decodeURIComponent(s.replace(/\+/g, '%20'));
export const getURLParams = () => {
    const params = {};
    let url = window.location.href;
    let m = window.location.href.match(/[\\?&]([^=]+)=([^&#]*)/g);
    
    if (m) {
        let i = 0;
        while (i < m.length) {
            const a = m[i].match(/.([^=]+)=(.*)/);
            params[unescapeURL(a[1])] = unescapeURL(a[2]);
            i += 1;
        }
    }
    if (!params.workerId && !params.assignmentId && !params.hitId) {
        // eslint-disable-next-line no-undef
        if (DEV_MODE) {
            console.log(
                'App running in dev mode so HIT submission will not work!\nTo test in the sandbox make sure to deploy the app.'
            );
            params.workerId = 'test-worker';
            params.assignmentId = 'test-assignment';
            params.hitId = 'test-hit';
            params.turkSubmitTo = 'test-submit';
        }
    }
    return params;
};

// Use those functions to get the window URL params and make them available throughout the app
export const params = getURLParams();