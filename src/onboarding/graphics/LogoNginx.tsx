// Libraries
import React, {SFC} from 'react'

interface Props {
  width?: number
  height?: number
}

const LogoNginx: SFC<Props> = ({height, width}) => {
  return (
    <svg
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 87.14 100"
    >
      <style>
        {`
          .nginx_a {
            fill: #009438;
            }
          .nginx_b {
            fill: #fefefe;
            }`}
      </style>
      <defs />
      <path
        className="nginx_a"
        d="M0,50.07V26.21a2.14,2.14,0,0,1,1.2-2C15,16.21,28.68,8.35,42.37.4A2.09,2.09,0,0,1,44.68.3L86,24.17a2.22,2.22,0,0,1,1.11,2V73.84a2.22,2.22,0,0,1-1.11,2L50.51,96.42c-1.85,1.11-3.8,2.22-5.65,3.23a2.37,2.37,0,0,1-2.49,0C32,93.73,21.74,87.72,11.38,81.8c-3.42-1.94-6.85-4-10.27-5.92A2.08,2.08,0,0,1,0,73.94Z"
      />
      <path
        className="nginx_b"
        d="M29.14,41.19V69a5.75,5.75,0,0,1-5.83,5.83,5.51,5.51,0,0,1-4.72-2.68,4.86,4.86,0,0,1-.74-2.78V30.74a5.59,5.59,0,0,1,3.61-5.27,8.63,8.63,0,0,1,6.11,0,9.8,9.8,0,0,1,4.71,3.23c4,4.81,8,9.62,12,14.43,4.16,5,8.42,10,12.58,15.08a5.25,5.25,0,0,0,.37.46V30.55A5.39,5.39,0,0,1,62.16,25a5.61,5.61,0,0,1,6.39,4.81V69.22A5.16,5.16,0,0,1,65.68,74a8.17,8.17,0,0,1-4.44.83,10.08,10.08,0,0,1-6.11-2.59,35.29,35.29,0,0,1-2.4-2.77C48.19,64,43.66,58.67,39.13,53.22L29.32,41.47C29.32,41.38,29.23,41.28,29.14,41.19Z"
      />
    </svg>
  )
}

export default LogoNginx
