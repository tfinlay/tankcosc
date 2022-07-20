import Mathjax from "react-mathjax"

export const MathSpan = ({math}) => {
  return (
      <Mathjax.Provider>
        <Mathjax.Node inline formula={math}/>
      </Mathjax.Provider>
  )
}