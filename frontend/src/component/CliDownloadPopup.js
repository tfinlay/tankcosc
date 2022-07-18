import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Dialog,
  DialogContent,
  DialogTitle, Icon, Paper, ToggleButton,
  ToggleButtonGroup, Tooltip
} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useCallback, useState} from "react";
import {Apple, DesktopWindows, ExpandMore, Warning} from "@mui/icons-material";
import Box from "@mui/material/Box";
import {FaApple, FaGithub, FaLinux, FaWindows} from "react-icons/fa";
import {GAME_SERVER_PATH} from "../config";

export const CliDownloadPopup = ({ open, onClose, secretKey }) => {
  const [showDownload, setShowDownload] = useState(true)

  return (
      <Dialog open={open} onClose={onClose} scroll="body">
        <DialogContent>
          <Typography variant='h5'>Tanko CLI</Typography>
          <Typography variant='h6'>Write bots in your preferred language, with your preferred tools</Typography>
          <Typography variant='body1'>
            The CLI acts as a bridge between your code running on your machine and the game server.
            Tanko takes care of the tricky stuff and lets you focus on making the ultimate battle bot in your favourite language and with your favourite tools!
          </Typography>

          <Box sx={{marginTop: 1}}>
            <DownloadPlatformChooser open={showDownload} onChange={() => setShowDownload(prev => !prev)}/>
            <QuickStartDocs open={!showDownload} onChange={() => setShowDownload(prev => !prev)} secretKey={secretKey}/>
          </Box>

        </DialogContent>
      </Dialog>
  )
}

const DownloadPlatformChooser = ({open, onChange}) => {
  const onDownloadPlatformSelected = useCallback((evt, platform) => {
    if (platform === 'source') {
      window.open("https://github.com/tfinlay/tankcosc/tree/main/cli", "_blank")
    }
    else {
      window.open(`${GAME_SERVER_PATH}/download/cli?platform=${platform}`, "_blank")
      onChange()
    }
  }, [])

  return (
      <Accordion expanded={open} onChange={onChange}>
        <AccordionSummary expandIcon={<ExpandMore/>}>
          <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 500 }}>
            Download Tanko CLI
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ToggleButtonGroup
              orientation='horizontal'
              exclusive
              color='primary'
              sx={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)'
              }}
              onChange={onDownloadPlatformSelected}
          >
            <ToggleButton value='windows'>
              <DownloadPlatformChooserPlatformButtonContent
                  icon={<FaWindows size={64}/>}
                  name="Windows"
              />
            </ToggleButton>
            <ToggleButton value='macos'>
              <DownloadPlatformChooserPlatformButtonContent
                icon={<FaApple size={64}/>}
                name="MacOS"
                subtitle="Intel only"
              />
            </ToggleButton>
            <ToggleButton value='linux'><DownloadPlatformChooserPlatformButtonContent/>
              <DownloadPlatformChooserPlatformButtonContent
                  icon={<FaLinux size={64}/>}
                  name="Linux"
              />
            </ToggleButton>
            <ToggleButton value='source'><DownloadPlatformChooserPlatformButtonContent/>
              <DownloadPlatformChooserPlatformButtonContent
                  icon={<FaGithub size={64}/>}
                  name="Source Code"
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </AccordionDetails>
      </Accordion>
  )
}

const DownloadPlatformChooserPlatformButtonContent = ({icon, name, subtitle = undefined}) => {
  return (
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {icon}
        <Typography variant='subtitle1'>{name}</Typography>
        {subtitle && (
            <Typography variant='subtitle2'>{subtitle}</Typography>
        )}
      </Box>
  )
}

const QuickStartDocs = ({open, onChange, secretKey}) => {
  return (
      <Accordion expanded={open} onChange={onChange}>
        <AccordionSummary expandIcon={<ExpandMore/>}>
          <Typography sx={{ width: '33%', flexShrink: 0, fontWeight: 500 }}>
            Quick Start
          </Typography>
        </AccordionSummary>

        <AccordionDetails>

          <Typography variant='body1'>
            So, you've downloaded the Tanko CLI for your platform... Now what?<br/>
            After completing this quick start guide, you should have a bot running through the CLI!
          </Typography>

          <Paper elevation={1} sx={{padding: 1, fontSize: 12, marginTop: 1, color: "#555"}}>
            <Warning fontSize='small' sx={{verticalAlign: 'middle'}}/> This guide assumes that your preferred language has a Tanko template. If not, you'll have to build your own.<br/>
            If you build a template for a new language, or fix a bug in an existing template, please do <a href="https://github.com/tfinlay/tankcosc/tree/main/cli" target="_blank">contribute it to Tanko on GitHub</a> so it can be built in!
          </Paper>

          <Typography variant="body1">
            <ol>
              <li>Open a terminal in the same folder as tanko. (<a href="https://stackoverflow.com/a/60914" target="_blank">Windows</a>, <a href="https://apple.stackexchange.com/a/20633" target="_blank">MacOS</a>)</li>
              <li>Execute the command: <code>./tanko create <Tooltip title="You can replace this with a custom name for your bot"><span style={{fontStyle: "italic", color: 'grey'}}>my-bot</span></Tooltip></code></li>
              <li>
                Choose a language from the list of templates available.
                <div>Hint: if you want to write your own language binding choose <code>cmd</code>.</div>
              </li>
              <li>Enter the game server URL: <code>{GAME_SERVER_PATH}</code></li>
              <li>Enter your secret key: <code>{secretKey}</code></li>
              <div style={{marginLeft: "-1em"}}>
                <div>All going well, your bot's code and configuration should now live in a new folder with the name you gave in the command earlier.</div>
                <div style={{marginTop: 2}}>The command should also have told you which file your bot code lives in, and let you know if there are any extra steps you need to perform.</div>
              </div>
              <li>To start the bot, run: <code>./tanko start <Tooltip title="Replace this with the name you gave your bot earlier"><span style={{fontStyle: "italic", color: 'grey'}}>my-bot</span></Tooltip></code></li>
              <li>To stop your bot manually, press <code>Ctrl + C</code></li>
              <li>Happy battling!</li>
            </ol>
          </Typography>

          <Typography variant="body1">Here's a quick video running through the steps:</Typography>
          <iframe width="100%" style={{aspectRatio: "16 / 9"}} src="https://www.youtube-nocookie.com/embed/RjeDbUdYlMw"
                  title="YouTube video player" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen></iframe>
        </AccordionDetails>
      </Accordion>
  )
}