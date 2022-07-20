import {Typography} from "@mui/material";
import Box from "@mui/material/Box";
import {MathSpan} from "./MathSpan";

export const SimpleGameDocumentation = () => {
  return (
      <Box>
        <Typography variant="h5">Gameplay</Typography>
        <Typography variant="body1">
          You are writing code to control a 'tank' as it fights others on the big screen.<br/>
          The game is turn-based (though the turns are very fast - fractions of a second), so each command your tank is given takes a number of turns.<br/>
          Each turn the following things occur in order:<br/>
          <ol>
            <li>Your last command is executed and you receive a status update from your tank.</li>
            <li>Projectiles are moved.</li>
            <li>Collisions are checked and your tank will take damage or be destroyed if it is hit.</li>
            <li>Your tank gains energy if it is still alive.</li>
            <li>Repeat.</li>
          </ol>
        </Typography>
        <Typography variant="body1" sx={{marginTop: 1}}>
          Things to note:<br/>
          <ul>
            <li>Commands that take energy will not exceed the amount of energy available at the time they are executed. If you specify more energy than your tank has, only the amount you have will be used.</li>
            <li>You are given energy every turn. HP is not automatically regenerated. You must call the <code>heal(energy)</code> function for this.</li>
          </ul>
        </Typography>

        <Typography variant="h5">Functions</Typography>
        <Typography variant="subtitle2">NOTE: Please place <code>await</code> before any of these function calls, otherwise your bot will lose sync with the server!</Typography>

        <Typography variant="h6" sx={{fontFamily: 'monospace'}}>print(message)</Typography>
        <Typography variant="body1">
          This function takes 0 turns and places the text that you specify in it in the log.
          See the example code or <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Text_formatting#multi-line_template_literals" target="_blank">here</a> for some handy ways to print things the way you like!
        </Typography>

        <Typography variant="h6" sx={{fontFamily: 'monospace', marginTop: 1}}>shoot(energy)</Typography>
        <Typography variant="body1">
          Takes 1 turn. Shoots with the energy given in the direction that your tank is currently facing.
        </Typography>
        <Typography variant="body1" sx={{marginTop: 1}}>
          All shots are the same size, but the speed (and the damage inflicted in case of a collision) increases linearly with the amount of energy they are given.
        </Typography>

        <Typography variant="h6" sx={{fontFamily: 'monospace', marginTop: 1}}>rotate(degrees)</Typography>
        <Typography variant="body1">
          Takes 1 turn. Rotates the tank a given number of degrees clockwise. Negative values are permitted.
        </Typography>

        <Typography variant="h6" sx={{fontFamily: 'monospace', marginTop: 1}}>move(energy)</Typography>
        <Typography variant="body1">
          Takes 1 turn. Consumes the given amount of energy and moves the tank a distance in the direction that it is facing.
        </Typography>
        <Typography variant="body1" sx={{marginTop: 1}}>
          The distance travelled is given by this equation: <MathSpan math={`\\sqrt{\\sqrt{energy}}`}/>
        </Typography>

        <Typography variant="h6" sx={{fontFamily: 'monospace', marginTop: 1}}>heal(energy)</Typography>
        <Typography variant="body1">
          Takes 1 turn. Consumes the given amount of energy an heals the tank.
        </Typography>
        <Typography variant="body1" sx={{marginTop: 1}}>
          The HP healed increases linearly with the amount of energy given.
        </Typography>

        <Typography variant="h6" sx={{fontFamily: 'monospace', marginTop: 1}}>scan()</Typography>
        <Typography variant="body1">
          Takes 1 turn and 200 energy. Scans the surroundings of the tank, yielding a list of all other live tanks with their distance and the approximate number of degrees rotation needed to be facing them (in order from closest to farthest enemy).
        </Typography>
        <Typography variant="body1" sx={{marginTop: 1}}>
          This data is placed into <code>lastScanResult</code>, which is an array of ranging measurements. For example, to get the distance and relative angle of the closest enemy from this tank:

          <code style={{marginLeft: 12, display: 'block'}}>
            {`let target = lastScanResult[0];`}<br/>
            {`print(\`Distance: \${target.distance}. Rotation: \${target.relativeAngle}\`);`}
          </code>
        </Typography>

        <Typography variant="h6" sx={{marginTop: 1}}><code>wait()</code> or <code>poll()</code></Typography>
        <Typography variant="body1">
          Two equivalent functions that take 1 turn and do nothing.
        </Typography>
      </Box>
  )
}