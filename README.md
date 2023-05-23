## Inspiration
The inspiration behind building DMedico stemmed from our personal experiences as patients navigating the complex healthcare system. We recognized the challenges and frustrations of managing medical files, especially when seeking care from multiple doctors. We understood the importance of sharing specific files with different healthcare professionals while maintaining control over our personal information.

With DMedico, we set out to create a solution that would empower patients with the ability to securely share different files with different doctors. We wanted to ensure that patients have full control over their medical information and the freedom to manage access permissions as needed. By leveraging decentralized technology and robust security measures, DMedico provides a seamless and trusted platform for file transfer between medics and patients.

Our goal is to simplify the process of sharing medical data, eliminate the risks of lost or inaccessible files, ease the process of managing tons of medical files and enhance collaboration between patients and healthcare providers. DMedico enables patients to maintain ownership of their health records while fostering a secure and efficient exchange of information. We believe that by putting patients at the center of their healthcare journey, we can improve outcomes, streamline diagnoses, and enhance the overall quality of care.


## What it does

DMedico is a platform that redefines the way medical data is managed and shared. Our mission is to provide patients with complete control over their medical files while enabling seamless collaboration with healthcare professionals. Here's what DMedico does:

### Secure Decentralized File Storage:
DMedico leverages cutting-edge technologies such as the Filecoin Virtual Machine (FVM) and Spheron, an IPFS-based distributed storage application. This decentralized approach ensures that your medical files are securely stored across a network of distributed nodes. DMedico also uses Polybase to store all file related metadata. By eliminating reliance on a single centralized server, DMedico enhances data availability, fault-tolerance, and scalability, while preserving the confidentiality and integrity of your sensitive medical records.

### Granular Access Control:
With DMedico, you have full authority over who can access your medical files. Through a user-friendly interface, you can easily manage access permissions for different healthcare professionals based on their wallet addresses. This allows you to selectively share specific files with specific individuals, ensuring that only authorized personnel can view and interact with your medical data. Maintain your privacy while collaborating effectively with your trusted medical team.

### Secure File Transfer:
At DMedico, the security of your medical files is paramount. We employ advanced asymmetric encryption techniques, including the highly secure AES256 encryption, to protect your files during transmission. By encrypting your data and employing secure channels, we ensure that your files remain confidential and safeguarded against unauthorized access. With DMedico, you can confidently transfer sensitive medical information without compromising security.

In a nutshell, DMedico revolutionizes the management of medical files by providing secure decentralized file storage, granular access control, and robust file transfer security. With our platform, you can securely store and share your medical data, collaborate seamlessly with healthcare professionals, and maintain full control over your sensitive information. Experience a new era of medical file management with DMedico, where privacy, security, and collaboration converge.

## How we built it
Building DMedico was a complex process. Let me give you a detailed part-by-part analysis of how we built it.

### Frontend: 
The frontend was designed in figma and then was coded in a native JavaScript environment (Vanilla HTML & CSS). We integrated metamask on the client side to facilitate user authentication & identification. The frontend starts by fetching the wallet address from Metamask and sends it to our API to fetch all file records for that wallet address. The API reverts back with all existing records and their details. Users have an option to add new files. Upon adding a file we make another call to the API and pass the following details to the API.

1. File ID: Unique six digit file identification number
2. File Name: Name of the file
3. Date & Time: Date & Time of the file upload.

The API then returns with an IPFS link, this link corresponds to that file and is solely for user's viewing purpose. When the user clicks on manage access, we send another request to the API to fetch records of the people who have access to that specific File ID. Users also have options to revoke access for any file recipient at any time, clicking on it makes an API call to delete that specific record. When the user clicks on viewing shared files, we make a call to our API to fetch records of the files that have been shared with him. Users are shown the following details about incoming files in a tabular form:

1. Wallet address the file is coming from
2. File name
3. Remarks (if any)
4. Date & Time of sharing
5. Unique option to view the file. 

### Backend
Our backend runs in a Node JS based environment. We used express.js as our backend framework. The backend is a docker container and runs independently as a microservice on google cloud. Whenever there is an API call to add a file to our database, the backend generates a car file and extracts the relevant information required to make a storage deal on FVM. Once the backend gets a confirmation of a successful storage deal, the backend API is invoked again to upload the file to a Spheron bucket and then the API returns the IPFS link to the frontend. 

Once the frontend gets the IPFS link, we make a call to the backend API to update all file and user related details in our Polybase database. Additionally when the user logs in to DMedico / refreshes, all the files' metadata uploaded by the user is fetched from Polybase though a backend API call and displayed on the frontend. when a file is shared with a medic or access of a file is revoked and a file is deleted the backend API is invoked to update the polybase with the access control information. Going forward we intend to enhance the access control mechanism to run on FVM. Here is what our Polybase schema looks like:

```
//Your files
@public
collection files {
  id: string;
  owner: string;
  filename: string;
  dateTime: string;
  ipfsurl: string;

  constructor (id: string, owner: string, filename: string, dateTime: string, ipfsurl: string ) {
    this.id = id;
    this.owner = owner;
    this.filename = filename;
    this.dateTime = dateTime;
    this.ipfsurl = ipfsurl; 
  }

  del () {    
    selfdestruct();
  }
}

// Files shared with you
  @public
  collection access {
  id: string;
  owner: string;
  filename: string; 
  ipfsurl: string;
  username: string; 
  userwallet: string; 

  constructor (id: string, owner: string, filename: string, ipfsurl: string, username: string, userwallet: string ) {
    this.id = id;
    this.owner = owner;
    this.filename = filename;
    this.ipfsurl = ipfsurl;
    this.username = username;
    this.userwallet = userwallet; 
  }

  del () {    
    selfdestruct();
  }
  
}
```


Our frontend is hosted independently on filecoin network through the help of spheron static app hosting. The frontend reacts with the backend which is independently hosted on https://dmedico-6k6gsdlfoa-em.a.run.app/.  Currently we have implemented access control features by applying logic to the metadata that we store on Polybase. But going forward we intend to enhance the access control mechanism to run on FVM. We've also implemented single-end AES-256 encryption to secure the files stored on IPFS. In the future, we'll implement an end to end AES-256 encryption.



## Challenges we ran into
1. It was our first time interacting with FVM and striking a deal to store files on FVM. We encountered several issues while doing this, the biggest one on which we were stuck for 2 days was to obtain the properties of the signer object. We were able to log the signer object properly in our console, but were not being able to send the signer object to our backend. We thought it was protected and hence appears as an empty object in the backend. At the end the issue was resolved by a protocol labs member who guided us to convert the CID to hex. We were out of our wits 😣

2. It was our first time working with Polybase, so we had to learn the syntax and set it up in last few hours of the hackathon. We faced a silly but lengthy issue with Polybase. We were properly creating a schema but getting such a big error that we couldn't even copy that error. After hours of debugging and crying, we found out that we're missing a parameter 🙂.

3.  Our frontend was initially in react, but due to some incompatibility issues & lack of expertise we had to switch mid-way to native JS and vanilla HTML/CSS. Due to this we also had some redundancy and slow performance of processes in our application. We had to send the file to the API first and then the API triggers the smart contract and strikes a deal with FVM, if we had used React, we could have directly sent the file to FVM after a successful storage deal. 



## Accomplishments that we're proud of:
1. Successfully implementing a smart contract that strikes deals to store files on FVM
2. Successfully storing our files on IPFS using Spheron & hosting our application on Spheron
3. Using Polybase as our database for storing file related metadata.
4. Implementing the access control feature, where only specific wallets have mutable access to specific files.
5. We're also proud of our neat & clean UI and fully functional frontend.


## What we learned
1. We learned a great deal about the FVM and it was our first time coding a smart contract with solidity and interacting with FVM
2. We learned a great deal about Spheron and it's services. We learned how to create spheron buckets and store & retrieve files. We also learned how to deploy your application on filecoin with the help of Spheron.
3. We learnt Polybase. We successfully setup a big schema for decentralized storing of File related metadata. We found Polybase to be intuitive and self-navigable and are sure to use it in our future projects.
4. We learnt how to efficiently work as a team, keep each other accountable, skill based work division and going out of our comfort zone to put each and every skill & sweat into our project.

## What's next for DMedico
1. Implementing more access control features, and migrating to FVM to implement the access-control feature.
2. Adding a end-to-end file encryption so that the file is encrypted and decrypted multiple times which enhances safety and confidentiality.
3. Scaling the platform to add options to store heavier data on our platform.



