'use client'

// components/Invitations.js
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getAllTasks, getUserData, verifyTask } from '@/app/apis';
import axios from 'axios';
import useChecksumAccount from '@/lib/useChecksumAccount';


interface UserData {
  username: string;
  state: {
    level: number;
    points: number;
  };
  character: any; // Adjust according to the actual structure
  level_rank: number;
  point_rank: number;
  invite_codes?: { [key: string]: InviteCodeDetails };
  tasks: any;

}

interface InviteCodeDetails {
  one_time: boolean;
  used: boolean;
}

interface Task {
  task_id: string;
  task_title: string;
  task_points: number;
  task_type: string;
  task_link: string;
  task_origin: string;
}

type Tasks = Task[];

const Invitations = () => {
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.remove();
    toast.success("Invitation Codes Copied!")
  };

  const getPstDateString = () => {
    const now = new Date();
    const pstDate = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    const dateParts = pstDate.split('/');
    return `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
  }

  const getStoredSignature = () => {
    const storedSignature = localStorage.getItem('signature');
    const dateSigned = localStorage.getItem('dateSigned');
    const currentDate = getPstDateString();

    return dateSigned === currentDate ? storedSignature : '';
  };

  const getAndLoadUserData = async (force?:boolean) => {
    if (!address || !signature) {
      return
    }
    if(!force && userDataLoaded){
      return
    }
    const userData = await getUserData(address, signature)
    //console.log("resultData", userData)

    setUserData(userData)
    setUserDataLoaded(true)
    setNumInvited(countUsedCodes(userData))

    const tasksData = await getAllTasks()
    //console.log("Tasks fetched:", tasksData);
    //console.log("UserData", userData);
    
    const sortedTasks = (Object.values(tasksData) as Task[]).sort((a: Task, b: Task) => {
      // Check completion status
      //console.log(a.task_id,userData.tasks?.[a.task_id]?.completed)
      //console.log(b.task_id,userData.tasks?.[b.task_id]?.completed)
      const completedA = userData.tasks?.[a.task_id]?.completed || false;
      const completedB = userData.tasks?.[b.task_id]?.completed || false;
      if (completedA && !completedB) {
        //console.log(111111)
        return 1;
      }
      if (!completedA && completedB){
        //console.log(-111111)
        return -1;
      } 
      // If both have the same completion status, sort by points ascending
      return a.task_points-b.task_points;
    });
    console.log("sortedTasks:",sortedTasks)
    // Convert sorted array back to object if necessary
    //const tasksObject: Tasks = sortedTasks.reduce((obj, task) => ({ ...obj, [task.task_id]: task }), {});
    //console.log("Tasks sort:",tasksObject)
    setTasks(sortedTasks);
  }

  function getFirstOrUnusedInviteCode(userData: UserData | undefined): string | undefined {
    if (!userData || !userData.invite_codes) {
      return undefined;
    }

    let firstCode: string | undefined = undefined;

    for (const code in userData.invite_codes) {
      if (userData.invite_codes.hasOwnProperty(code)) {
        if (!firstCode) {
          firstCode = code; // Store the first code encountered
        }
        const details = userData.invite_codes[code];
        if (!details.used) {
          return code; // Return the first unused code found
        }
      }
    }

    return firstCode; // Return the first code if no unused code is found
  }

  const router = useRouter()
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [userData, setUserData] = useState<UserData>();
  const { address, isConnecting, isDisconnected } = useChecksumAccount()
  const [signature, setSignature] = useState(getStoredSignature);
  const [numInvited, setNumInvited] = useState(0);
  const [tasks, setTasks] = useState<Tasks>();

  const countUsedCodes = (userData: UserData) => {
    return Object.values(userData.invite_codes ?? {}).reduce((acc, detail) => {
      return acc + (detail.used ? 1 : 0);
    }, 0);
  };

  useEffect(() => {
    const addressSigned = localStorage.getItem('addressSigned');
    if (!address || !signature || addressSigned != address) {
      router.push("/")
      toast.remove();
      toast.error("Please click ENTER to sign in")
      return
    }
    else {
      // get and load user data
      getAndLoadUserData()
    }
  }, [useChecksumAccount()]);

  useEffect(() => {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.parentNode?.removeChild(star);
    });
    document.body.style.backgroundImage = `url('bg-plain.png')`;
    document.body.style.backgroundSize = 'cover'; // Cover the entire page
    document.body.style.backgroundRepeat = 'no-repeat'; // Do not repeat the image
    document.body.style.overflow = 'hidden';
  }, []);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    function handleResize() {
      setIsMobile(window.innerWidth <= 768); // Assuming 768px as a breakpoint for mobile
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => {
      window.removeEventListener('resize', handleResize);
    };


  }, []);

  const TaskBento = ({ taskImage, link, points, text, verifyfunc, completed, claim_after_go }: { taskImage: string, link: string, points: number, text: string, verifyfunc: any, completed: boolean, claim_after_go:boolean }) => {
    const openInNewTab = (url: string) => {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
      if (newWindow) newWindow.opener = null
    }
    const [goClicked, setGoClicked] = useState(false)
    return (
      <div style={{ opacity:completed?"70%":"100%",backgroundColor: "#FAFAFA", marginTop: "10px", width: "100%", borderRadius: "10px", borderWidth: "2px", borderColor: "#013359", padding: "15px" }}>
        <img src={taskImage} style={{ width: "40px", height: "40px", borderRadius: "3px" }}></img>
        <p style={{ fontFamily: "DM Sans", marginTop: "10px", marginBottom: "0px", color: "black", fontSize: "20px", fontWeight: "700" }}>{text}</p>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: "end", gap: '10px' }}>
          <p
            style={{
              display: 'inline-block',
              fontSize: "24px",
              borderRadius: "3px",
              fontFamily: "GLY",
              marginRight: "auto",
              whiteSpace: "nowrap"
            }}
            className={`py-2 text-center text-tfr`}
          >
            +{points} <img src={'/flamer-red.svg'} style={{ marginLeft: "-5px", width: "25px", marginTop: "0px", display: 'inline-block', verticalAlign: 'middle' }} alt="" />
          </p>
          {
            completed ?
              <p
                style={{
                  fontSize: "24px",
                  fontFamily: "GLY",
                  textTransform: "uppercase"
                }}
              >Completed</p> :
              <>
                {(!goClicked) && link && <button
                  style={{
                    display: 'inline-block',
                    cursor: "pointer",
                    fontSize: "24px",
                    borderRadius: "3px",
                    transition: "background-color 0.2s ease 0s, color 0.2s ease 0s",
                    fontFamily:"GLY",
                fontWeight:"300"
                  }}
                  className={`py-2 px-4 text-center font-bold text-lg bg-[#013359] text-white`}
                  onClick={() => { openInNewTab(link); setGoClicked(true) }}>
                  GO
                </button>}
                {(!claim_after_go || goClicked) &&
                <button
                  style={{
                    display: 'inline-block',
                    cursor: "pointer",
                    fontSize: "24px",
                    borderRadius: "3px",
                    transition: "background-color 0.2s ease 0s, color 0.2s ease 0s",
                    fontFamily:"GLY",
                fontWeight:"300"
                  }}
                  className={`py-2 px-4 text-center font-bold text-lg bg-[#013359] text-white`}
                  onClick={verifyfunc}>
                  CLAIM
                </button>}
              </>
          }
        </div>
      </div>
    )
  }
  const chunkTasks = (tasks: Tasks): Task[][] => {
    const taskEntries = tasks
    const chunks = [];
    for (let i = 0; i < taskEntries.length; i += 2) {
      chunks.push(taskEntries.slice(i, i + 2));
    }
    return chunks;
  };

  //console.log(userData)
  async function handelVerifyTask(task_id: string) {
    if (!address || !signature) {
      router.push("/")
      return;
    }
    try {
      const response = await verifyTask(address, signature, task_id);
      //console.log('invite successful:', response);
      toast.success('task complete!');
      getAndLoadUserData(true);
    } catch (error) {
      console.error('Error during verify task:', error);
      let errorMessage = 'task verification failed!'; // Default message
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.detail || 'task verification failed!';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      //console.log('errorMessage', errorMessage)
      toast.remove()
      toast.error(errorMessage);
    }

  }

  //console.log(userData?.invite_codes)
  return (
    <div className="p-4" style={{ overflowY: "auto", height: isMobile ? "100%" : "80vh", scrollbarWidth: "none", msOverflowStyle: "none" }}>
      {/*<div >
        <p style={{ fontFamily: "GLY", color: "black", fontSize: "30px", fontWeight: "300" }} className="mb-2">INVITATIONS</p>

        <div style={{ backgroundColor: "#FAFAFA", width: "100%", borderRadius: "10px", borderWidth: "2px", borderColor: "#013359", padding: "15px" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', }}>

            <p style={{ fontFamily: "DM Sans", color: "black", fontSize: "20px", fontWeight: "700" }}>Invited: {numInvited}</p>
            <p style={{ fontFamily: "DM Sans", color: "black", fontSize: "20px", fontWeight: "700" }}>Earned: {numInvited * 20} <img src={'/flamer-black.svg'} style={{ marginLeft: "-5px", width: "25px", marginTop: "-5px", display: 'inline-block', verticalAlign: 'middle' }} alt="" /></p>
          </div>
          <p style={{ fontFamily: "DM Sans", color: "black", fontSize: "14px", fontWeight: "500" }}>{"(each new player invited earns you 20 points)"}</p>
          <hr style={{ border: "1px solid #013359", marginTop: "15px", marginBottom: "10px" }} /> 
          <p style={{ fontFamily: "DM Sans", color: "black", fontSize: "20px", fontWeight: "700" }}>Invite Codes:</p>

          <>
            {userData?.invite_codes && Object.entries(userData.invite_codes).map(([code, details]) => (
              <span className="text-gray-700 text-italic" key={code} style={{
                fontFamily: "DM Sans",
                fontStyle:"italic",
                fontSize: "24px",
                fontWeight: "700",
                color: (details.one_time && details.used) ? "gray" : "black",
                display: 'inline-block',
                marginRight: '8px'  // Added margin for guaranteed space
              }}>
                {code}{' '}
              </span>
            ))}
          </>
          <div style={{ display: "flex", alignContent: "end", marginTop: "10px" }}>
            <button
              style={{
                marginTop: isMobile ? "10px" : "",
                cursor: "pointer",
                fontSize: "24px",
                borderRadius: "3px",
                transition: "background-color 0.2s ease 0s, color 0.2s ease 0s",
                marginLeft: "auto",
                fontFamily:"GLY",
                fontWeight:"300"
              }}
              className="py-2 px-4 text-center font-bold text-lg bg-[#013359] text-white"
              onClick={() => {
                if (userData?.invite_codes) {
                  const sharecode = getFirstOrUnusedInviteCode(userData)
                  window.open(`https://twitter.com/intent/post?text=Dive+into+The+Five+Realms+@TheFiveRealms+adventure+with+Invite+Code%3A+${sharecode}.+Join+us+at+https%3A%2F%2Fplay.fiverealms.ai+and+start+your+AI+Crypto+Game+journey+today%21%0A%0A%23TheFiveRealms+%23AIGAME+%23RPG+%23GAMEFI`, "_blank")

                }
              }}>
              SHARE
            </button>
            <button
              style={{
                marginTop: isMobile ? "10px" : "",
                cursor: "pointer",
                fontSize: "24px",
                borderRadius: "3px",
                transition: "background-color 0.2s ease 0s, color 0.2s ease 0s",
                marginLeft: "10px",
                fontFamily:"GLY",
                fontWeight:"300"
              }}
              className="py-2 px-4 text-center font-bold text-lg bg-[#013359] text-white"
              onClick={() => {
                const allCodes = Object.entries(userData?.invite_codes ?? {})
                  .filter(([code, details]) => !details.used)
                  .map(([code]) => code)
                  .join('\n');
                handleCopyCode(allCodes);
              }}>
              COPY
            </button>
          </div>


        </div>
      </div>*/}
      <p style={{ fontFamily: "GLY", color: "black", fontSize: "30px", fontWeight: "300", marginTop: "0px" }} className="mb-2">Tasks</p>
      {tasks && chunkTasks(tasks).map((chunk, index) => (
        <div key={index} style={{ display: isMobile ? "" : 'flex', alignItems: 'center', gap: '10px', marginTop: "0px" }}>
          {chunk.map(task => (
            <TaskBento
              claim_after_go = {task.task_origin==="share"||task.task_origin==="twitter" || task.task_origin==="discord" || task.task_origin==="telegram"}
              key={task.task_id}
              completed={userData?.tasks?.[task.task_id]?.completed}
              text={task.task_title}
              taskImage={`/${task.task_origin}.svg`} // Example image, adjust as necessary
              link={task.task_link === "sharerank" ? `https://x.com/intent/post?text=%F0%9F%8E%89+I+am+currently+ranked+%23${userData?.point_rank?userData?.point_rank:"???"}+with+${userData?.state.points}+points+in+the+Five+Realms+world+%40TheFiveRealms%21+%F0%9F%8C%9F+Join+me+on+this+exciting+journey+and+let%27s+conquer+the+realms+together%21+%F0%9F%9A%80+%0A%0Ahttps%3A%2F%2Fplay.fiverealms.ai%0A%0A%23TheFiveRealms+%23AIGAME+%23RPG+%23GAMEFI` : task.task_link}
              points={task.task_points}
              verifyfunc={() => { handelVerifyTask(task.task_id) }} // Implement verification logic
            />
          ))}
        </div>
      ))}

    </div>
  );
};

export default Invitations;
