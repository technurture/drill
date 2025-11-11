export const GoogleIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 48 48"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.22 0 5.63 1.2 7.31 2.65l5.48-5.48C33.03 3.86 28.87 2 24 2 14.71 2 7.07 7.86 4.24 16.04l6.71 5.21C12.41 13.28 17.74 9.5 24 9.5z"
      />
      <path
        fill="#34A853"
        d="M9.95 26.58c-.32-1-.5-2.09-.5-3.23 0-1.13.18-2.23.5-3.23L3.24 15.09C2.42 17.12 2 19.5 2 22c0 2.5.42 4.88 1.24 6.91l6.71-5.21z"
      />
      <path
        fill="#FBBC05"
        d="M24 38.5c-5.96 0-11.03-3.64-13.07-8.85l-6.71 5.21C7.07 40.14 14.71 46 24 46c4.62 0 9.03-1.36 12.67-3.71l-6.11-4.72C28.52 38.02 26.3 38.5 24 38.5z"
      />
      <path
        fill="#4285F4"
        d="M46 24c0-1.32-.11-2.6-.31-3.83H24v7.66h12.7c-.54 2.79-2.15 5.15-4.55 6.76l6.11 4.72C41.77 36.06 46 30.56 46 24z"
      />
      <path fill="none" d="M2 2h44v44H2z" />
    </svg>
  );
};
export const CancleIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <circle cx="8" cy="8" r="8" fill="#F0F0F0" />
      <path
        d="M5 5L11 11"
        stroke="#000"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M11 5L5 11"
        stroke="#000"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};
export const ArrowBack = ({ className }: { className: string }) => {
  return (
    <svg
      width="41"
      height="41"
      viewBox="0 0 41 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.96875 19.2188H34.5938C34.9336 19.2188 35.2595 19.3537 35.4997 19.594C35.74 19.8343 35.875 20.1602 35.875 20.5C35.875 20.8398 35.74 21.1657 35.4997 21.406C35.2595 21.6463 34.9336 21.7812 34.5938 21.7812H8.96875C8.62894 21.7812 8.30305 21.6463 8.06277 21.406C7.82249 21.1657 7.6875 20.8398 7.6875 20.5C7.6875 20.1602 7.82249 19.8343 8.06277 19.594C8.30305 19.3537 8.62894 19.2188 8.96875 19.2188Z"
        fill="black"
        className={className}
      />
      <path
        d="M9.49916 20.5L20.1258 31.1242C20.3664 31.3647 20.5016 31.691 20.5016 32.0313C20.5016 32.3715 20.3664 32.6978 20.1258 32.9384C19.8853 33.179 19.559 33.3142 19.2187 33.3142C18.8785 33.3142 18.5522 33.179 18.3116 32.9384L6.78035 21.4072C6.66103 21.2881 6.56636 21.1468 6.50177 20.9911C6.43718 20.8354 6.40393 20.6686 6.40393 20.5C6.40393 20.3315 6.43718 20.1646 6.50177 20.009C6.56636 19.8533 6.66103 19.7119 6.78035 19.5929L18.3116 8.06166C18.5522 7.82107 18.8785 7.68591 19.2187 7.68591C19.559 7.68591 19.8853 7.82107 20.1258 8.06166C20.3664 8.30224 20.5016 8.62854 20.5016 8.96878C20.5016 9.30902 20.3664 9.63532 20.1258 9.87591L9.49916 20.5Z"
        fill="black"
        className={className}
      />
    </svg>
  );
};
export const CartIcon = ({ fill }: { fill: string }) => {
  return (
    <svg
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.9712 4.75C11.7444 5.14271 11.6251 5.58819 11.6251 6.04165C11.6251 6.49511 11.7444 6.94059 11.9711 7.3333C12.1979 7.72602 12.524 8.05213 12.9167 8.27887C13.3094 8.50561 13.7549 8.62499 14.2083 8.625H15.5V9.91667C15.5001 10.3752 15.6222 10.8254 15.8538 11.2212C16.0854 11.6169 16.4182 11.9438 16.818 12.1684C17.2177 12.393 17.67 12.5072 18.1285 12.4992C18.5869 12.4912 19.035 12.3613 19.4267 12.1228L19.025 14.0552C18.9644 14.3457 18.8056 14.6066 18.5753 14.7939C18.345 14.9811 18.0572 15.0833 17.7604 15.0833H7.23979L7.50846 16.375H16.7917C17.6141 16.3754 18.4152 16.6376 19.0788 17.1234C19.7424 17.6093 20.2342 18.2938 20.483 19.0777C20.7319 19.8616 20.7248 20.7044 20.4629 21.4841C20.2009 22.2637 19.6977 22.9398 19.026 23.4145C18.3544 23.8892 17.5491 24.1378 16.7267 24.1245C15.9043 24.1111 15.1075 23.8364 14.4516 23.3402C13.7957 22.8439 13.3147 22.1519 13.0782 21.3641C12.8418 20.5763 12.8621 19.7338 13.1362 18.9583H10.1137C10.3652 19.6709 10.4028 20.4415 10.2219 21.1752C10.041 21.9089 9.64955 22.5738 9.09568 23.0878C8.54182 23.6019 7.84972 23.9428 7.10459 24.0686C6.35946 24.1944 5.59381 24.0996 4.90187 23.7958C4.20994 23.4921 3.62193 22.9926 3.2102 22.3589C2.79848 21.7253 2.58102 20.9851 2.58459 20.2294C2.58816 19.4737 2.8126 18.7356 3.23029 18.1058C3.64798 17.4761 4.24069 16.9822 4.93546 16.685L2.17775 3.45833H1.29167C0.949095 3.45833 0.620555 3.32225 0.37832 3.08001C0.136086 2.83778 0 2.50924 0 2.16667C0 1.8241 0.136086 1.49555 0.37832 1.25332C0.620555 1.01109 0.949095 0.875 1.29167 0.875H3.22917C3.52599 0.874991 3.81376 0.977213 4.04407 1.16447C4.27437 1.35172 4.43316 1.61258 4.49371 1.90317L5.08787 4.75H11.9712Z"
        fill={fill}
      />
      <path
        d="M19.375 2.16667C19.375 1.8241 19.2389 1.49555 18.9966 1.25332C18.7544 1.01109 18.4259 0.875 18.0833 0.875C17.7407 0.875 17.4122 1.01109 17.1699 1.25332C16.9277 1.49555 16.7916 1.8241 16.7916 2.16667V4.75H14.2083C13.8657 4.75 13.5372 4.88609 13.2949 5.12832C13.0527 5.37055 12.9166 5.6991 12.9166 6.04167C12.9166 6.38424 13.0527 6.71278 13.2949 6.95501C13.5372 7.19725 13.8657 7.33333 14.2083 7.33333H16.7916V9.91667C16.7916 10.2592 16.9277 10.5878 17.1699 10.83C17.4122 11.0722 17.7407 11.2083 18.0833 11.2083C18.4259 11.2083 18.7544 11.0722 18.9966 10.83C19.2389 10.5878 19.375 10.2592 19.375 9.91667V7.33333H21.9583C22.3009 7.33333 22.6294 7.19725 22.8716 6.95501C23.1139 6.71278 23.25 6.38424 23.25 6.04167C23.25 5.6991 23.1139 5.37055 22.8716 5.12832C22.6294 4.88609 22.3009 4.75 21.9583 4.75H19.375V2.16667Z"
        fill={fill}
      />
    </svg>
  );
};
export const Trolley = ({ className }: { className: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 18C15.89 18 15 18.89 15 20C15 20.5304 15.2107 21.0391 15.5858 21.4142C15.9609 21.7893 16.4696 22 17 22C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20C19 19.4696 18.7893 18.9609 18.4142 18.5858C18.0391 18.2107 17.5304 18 17 18ZM1 2V4H3L6.6 11.59L5.24 14.04C5.09 14.32 5 14.65 5 15C5 15.5304 5.21071 16.0391 5.58579 16.4142C5.96086 16.7893 6.46957 17 7 17H19V15H7.42C7.3537 15 7.29011 14.9737 7.24322 14.9268C7.19634 14.8799 7.17 14.8163 7.17 14.75C7.17 14.7 7.18 14.66 7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.58 17.3 11.97L20.88 5.5C20.95 5.34 21 5.17 21 5C21 4.73478 20.8946 4.48043 20.7071 4.29289C20.5196 4.10536 20.2652 4 20 4H5.21L4.27 2M7 18C5.89 18 5 18.89 5 20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22C7.53043 22 8.03914 21.7893 8.41421 21.4142C8.78929 21.0391 9 20.5304 9 20C9 19.4696 8.78929 18.9609 8.41421 18.5858C8.03914 18.2107 7.53043 18 7 18Z"
        fill="#0F172A"
        className={className}
      />
    </svg>
  );
};
export const ArrowUp = ({fill}: {fill?: string}) => {
  return (
    <svg
      width="14"
      height="9"
      viewBox="0 0 14 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
       className="fill-[#A2A2A2] dark:fill-[#000000]"
    >
      <path
        d="M7.87485 0.899872L7 -6.11959e-07L1.57339e-07 7.20025L1.74969 9L7 3.60076L12.2503 9L14 7.20025L7.87485 0.899872Z"
        // fill={fill ? fill : `#A2A2A2`}
      />
    </svg>
  );
};
export const ArrowDown = ({fill}: {fill?: string}) => {
  return (
    <svg
      width="14"
      height="9"
      viewBox="0 0 14 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="fill-[#A2A2A2] dark:fill-[#000000]"
    >
      <path
        d="M7.87485 8.10013L7 9L1.57339e-07 1.79975L1.74969 1.07096e-06L7 5.39924L12.2503 1.52963e-07L14 1.79975L7.87485 8.10013Z"
        // fill={fill ? fill : `#A2A2A2`}
      />
    </svg>
  );
};
export const CheckMark = () => {
  return (
    <svg width="59" height="59" viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path className="dark:fill-[#FFFFFF]" fill-rule="evenodd" clip-rule="evenodd" d="M15.125 0.75C11.3125 0.75 7.65618 2.2645 4.96034 4.96034C2.2645 7.65618 0.75 11.3125 0.75 15.125V43.875C0.75 47.6875 2.2645 51.3438 4.96034 54.0397C7.65618 56.7355 11.3125 58.25 15.125 58.25H43.875C47.6875 58.25 51.3438 56.7355 54.0397 54.0397C56.7355 51.3438 58.25 47.6875 58.25 43.875V15.125C58.25 11.3125 56.7355 7.65618 54.0397 4.96034C51.3438 2.2645 47.6875 0.75 43.875 0.75H15.125ZM40.2238 25.7165C40.482 25.4409 40.6834 25.1171 40.8165 24.7637C40.9497 24.4102 41.0119 24.034 40.9996 23.6565C40.9873 23.279 40.9008 22.9076 40.745 22.5636C40.5892 22.2195 40.3671 21.9095 40.0915 21.6513C39.8159 21.393 39.4921 21.1916 39.1387 21.0585C38.7852 20.9253 38.409 20.8632 38.0315 20.8754C37.654 20.8877 37.2826 20.9742 36.9386 21.13C36.5945 21.2858 36.2845 21.5079 36.0263 21.7835L27.1626 31.2423L22.784 27.3524C22.2103 26.8755 21.4737 26.6402 20.7298 26.6964C19.9859 26.7525 19.2929 27.0956 18.7973 27.6532C18.3017 28.2107 18.0422 28.9392 18.0737 29.6845C18.1051 30.4299 18.4251 31.1338 18.966 31.6476L25.4348 37.3976C25.9945 37.8948 26.7261 38.1541 27.474 38.1202C28.2219 38.0864 28.9271 37.7622 29.4396 37.2165L40.2238 25.7165Z" fill="#0F172A"/>
    </svg>
  )
}
export const Loader = () => {
  return (
    <svg
    className="animate-spin h-5 w-5 text-current"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      fill="#A2A2A2"
    />
  </svg>
  )
}
export const AddProductIcon = ({name}: {name: string}) => {
 switch (name) {
  case "single":
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M3.12084 0.347488C5.69907 0.062027 8.30094 0.062027 10.8792 0.347488C12.3067 0.507488 13.4583 1.63165 13.6258 3.06415C13.9314 5.67915 13.9314 8.32083 13.6258 10.9358C13.4583 12.3683 12.3067 13.4925 10.8792 13.6525C8.30094 13.938 5.69907 13.938 3.12084 13.6525C1.69334 13.4925 0.541671 12.3683 0.374171 10.9358C0.068717 8.3211 0.068717 5.67971 0.374171 3.06499C0.458894 2.36905 0.776154 1.72211 1.27453 1.22903C1.77291 0.735941 2.4232 0.425608 3.12 0.348322M7.00001 2.83915C7.16577 2.83915 7.32474 2.905 7.44195 3.02221C7.55916 3.13942 7.62501 3.29839 7.62501 3.46415V6.37499H10.5358C10.7016 6.37499 10.8606 6.44084 10.9778 6.55805C11.095 6.67526 11.1608 6.83423 11.1608 6.99999C11.1608 7.16575 11.095 7.32472 10.9778 7.44193C10.8606 7.55914 10.7016 7.62499 10.5358 7.62499H7.62501V10.5358C7.62501 10.7016 7.55916 10.8606 7.44195 10.9778C7.32474 11.095 7.16577 11.1608 7.00001 11.1608C6.83424 11.1608 6.67527 11.095 6.55806 10.9778C6.44085 10.8606 6.37501 10.7016 6.37501 10.5358V7.62499H3.46417C3.29841 7.62499 3.13944 7.55914 3.02223 7.44193C2.90502 7.32472 2.83917 7.16575 2.83917 6.99999C2.83917 6.83423 2.90502 6.67526 3.02223 6.55805C3.13944 6.44084 3.29841 6.37499 3.46417 6.37499H6.37501V3.46415C6.37501 3.29839 6.44085 3.13942 6.55806 3.02221C6.67527 2.905 6.83424 2.83915 7.00001 2.83915Z" fill="#A2A2A2"/>
        </svg>
    )
  case "multiple":
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2.268C13.304 2.44353 13.5565 2.696 13.732 3.00003C13.9076 3.30406 14 3.64894 14 4V10C14 11.0609 13.5786 12.0783 12.8284 12.8284C12.0783 13.5786 11.0609 14 10 14H4C3.64894 14 3.30406 13.9076 3.00003 13.732C2.696 13.5565 2.44353 13.304 2.268 13H10C10.7956 13 11.5587 12.6839 12.1213 12.1213C12.6839 11.5587 13 10.7956 13 10V2.268ZM12 2C12 1.46957 11.7893 0.960859 11.4142 0.585786C11.0391 0.210714 10.5304 0 10 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V10C0 10.5304 0.210714 11.0391 0.585786 11.4142C0.960859 11.7893 1.46957 12 2 12H10C10.5304 12 11.0391 11.7893 11.4142 11.4142C11.7893 11.0391 12 10.5304 12 10V2ZM9 6C9 6.13261 8.94732 6.25979 8.85355 6.35355C8.75979 6.44732 8.63261 6.5 8.5 6.5H6.5V8.5C6.5 8.63261 6.44732 8.75979 6.35355 8.85355C6.25979 8.94732 6.13261 9 6 9C5.86739 9 5.74021 8.94732 5.64645 8.85355C5.55268 8.75979 5.5 8.63261 5.5 8.5V6.5H3.5C3.36739 6.5 3.24021 6.44732 3.14645 6.35355C3.05268 6.25979 3 6.13261 3 6C3 5.86739 3.05268 5.74021 3.14645 5.64645C3.24021 5.55268 3.36739 5.5 3.5 5.5H5.5V3.5C5.5 3.36739 5.55268 3.24021 5.64645 3.14645C5.74021 3.05268 5.86739 3 6 3C6.13261 3 6.25979 3.05268 6.35355 3.14645C6.44732 3.24021 6.5 3.36739 6.5 3.5V5.5H8.5C8.63261 5.5 8.75979 5.55268 8.85355 5.64645C8.94732 5.74021 9 5.86739 9 6Z" fill="#A2A2A2"/>
      </svg>
    )
  case "upload": 
   return (
        <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5625 12.1875V8.8125H10.8125L8 5.4375L5.1875 8.8125H7.4375V12.1875H4.625V12.1594C4.5305 12.165 4.4405 12.1875 4.34375 12.1875C3.22487 12.1875 2.15181 11.743 1.36064 10.9519C0.569474 10.1607 0.125 9.08763 0.125 7.96875C0.125 5.80425 1.76188 4.04025 3.86225 3.79838C4.04641 2.83571 4.56026 1.9673 5.31543 1.34251C6.07059 0.717717 7.01988 0.375601 8 0.375C8.98026 0.375542 9.92971 0.717613 10.6851 1.34239C11.4404 1.96717 11.9545 2.83561 12.1389 3.79838C14.2393 4.04025 15.8739 5.80425 15.8739 7.96875C15.8739 9.08763 15.4294 10.1607 14.6382 10.9519C13.8471 11.743 12.774 12.1875 11.6551 12.1875C11.5606 12.1875 11.4695 12.165 11.3739 12.1594V12.1875H8.5625Z" fill="#A2A2A2"/>
    </svg>
      )
 }
}
export const OnPageLoad = ({ className }: { className: string }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="2000"
      height="900"
      viewBox="0 0 2000 900"
      fill="none"
    >
      <g clipPath="url(#clip0_70_397)">
        <rect
          x="332.41"
          width="448.753"
          height="24"
          rx="6"
          fill="url(#paint0_linear_70_397)"
        />
        <rect
          x="332.41"
          y="24"
          width="653.74"
          height="24"
          rx="6"
          fill="url(#paint1_linear_70_397)"
        />
        <rect
          x="1720.22"
          y="15"
          width="149.584"
          height="18"
          rx="6"
          fill="url(#paint2_linear_70_397)"
        />
        <rect
          x="756.233"
          y="96"
          width="382.272"
          height="13"
          rx="6"
          fill="url(#paint3_linear_70_397)"
        />
        <rect
          x="545.706"
          y="121"
          width="803.324"
          height="27"
          rx="6"
          fill="url(#paint4_linear_70_397)"
        />
        <rect
          x="1048.04"
          y="57"
          width="803.324"
          height="27"
          rx="6"
          fill="url(#paint5_linear_70_397)"
        />
        <rect
          x="408.126"
          y="184.167"
          width="64.6353"
          height="11.6667"
          rx="5.83333"
          fill="url(#paint6_linear_70_397)"
        />
        <rect
          x="529.086"
          y="180"
          width="182.825"
          height="20"
          rx="6"
          fill="url(#paint7_linear_70_397)"
        />
        <rect
          x="1126.5"
          y="185.833"
          width="46.1681"
          height="8.33333"
          rx="4.16667"
          fill="url(#paint8_linear_70_397)"
        />
        <rect
          x="1238.23"
          y="180"
          width="337.95"
          height="20"
          rx="6"
          fill="url(#paint9_linear_70_397)"
        />
        <rect
          x="66.4818"
          y="248"
          width="542.936"
          height="20"
          rx="6"
          fill="url(#paint10_linear_70_397)"
        />
        <rect
          x="66.4818"
          y="272"
          width="781.163"
          height="48"
          rx="6"
          fill="url(#paint11_linear_70_397)"
        />
        <rect
          x="66.4818"
          y="332"
          width="360.111"
          height="20"
          rx="6"
          fill="url(#paint12_linear_70_397)"
        />
        <rect
          x="1047.09"
          y="248"
          width="443.213"
          height="20"
          rx="6"
          fill="url(#paint13_linear_70_397)"
        />
        <rect
          x="1047.09"
          y="272"
          width="781.163"
          height="48"
          rx="6"
          fill="url(#paint14_linear_70_397)"
        />
        <rect
          x="1047.09"
          y="332"
          width="360.111"
          height="20"
          rx="6"
          fill="url(#paint15_linear_70_397)"
        />
        <rect
          y="403.5"
          width="360.111"
          height="13"
          rx="6"
          fill="url(#paint16_linear_70_397)"
        />
        <rect
          x="97.8767"
          y="454.5"
          width="91.2642"
          height="15"
          rx="6"
          fill="url(#paint17_linear_70_397)"
        />
        <rect
          x="277.008"
          y="448"
          width="1722.99"
          height="16"
          rx="6"
          fill="url(#paint18_linear_70_397)"
        />
        <rect
          x="1759"
          y="453"
          width="27.7008"
          height="10"
          rx="5"
          fill="url(#paint19_linear_70_397)"
        />
        <rect
          x="277.008"
          y="470"
          width="1551.25"
          height="16"
          rx="6"
          fill="url(#paint20_linear_70_397)"
        />
        <rect
          x="101.375"
          y="524.298"
          width="85.3429"
          height="15.4044"
          rx="6"
          fill="url(#paint21_linear_70_397)"
        />
        <rect
          x="277.008"
          y="518"
          width="1722.99"
          height="16"
          rx="6"
          fill="url(#paint22_linear_70_397)"
        />
        <rect
          x="1759"
          y="523"
          width="27.7008"
          height="10"
          rx="5"
          fill="url(#paint23_linear_70_397)"
        />
        <rect
          x="277.008"
          y="540"
          width="1551.25"
          height="16"
          rx="6"
          fill="url(#paint24_linear_70_397)"
        />
        <rect
          y="631.5"
          width="853.186"
          height="13"
          rx="6"
          fill="url(#paint25_linear_70_397)"
        />
        <rect
          x="66.4818"
          y="682"
          width="265.928"
          height="47.7084"
          rx="6"
          fill="url(#paint26_linear_70_397)"
        />
        <rect
          x="133.188"
          y="751"
          width="113.747"
          height="38.625"
          rx="6"
          fill="url(#paint27_linear_70_397)"
        />
        <rect
          x="421.053"
          y="682"
          width="1407.2"
          height="40"
          rx="6"
          fill="url(#paint28_linear_70_397)"
        />
        <rect
          x="421.053"
          y="734"
          width="1407.2"
          height="51"
          rx="6"
          fill="url(#paint29_linear_70_397)"
        />
        <rect
          x="462.604"
          y="803.284"
          width="49.8615"
          height="9.21598"
          rx="4.60799"
          fill="url(#paint30_linear_70_397)"
        />
        <rect
          x="542.936"
          y="799"
          width="393.352"
          height="18"
          rx="6"
          fill="url(#paint31_linear_70_397)"
        />
        <rect
          x="1041.55"
          y="804.28"
          width="55.4017"
          height="7.44098"
          rx="3.72049"
          fill="url(#paint32_linear_70_397)"
        />
        <rect
          x="1124.65"
          y="799"
          width="537.396"
          height="18"
          rx="6"
          fill="url(#paint33_linear_70_397)"
        />
        <rect
          x="118.778"
          y="858.92"
          width="198.699"
          height="46.08"
          rx="6"
          fill="url(#paint34_linear_70_397)"
        />
        <rect
          x="95.844"
          y="858.92"
          width="208.893"
          height="44.1601"
          rx="6"
          fill="url(#paint35_linear_70_397)"
        />
        <rect
          x="83.1023"
          y="857"
          width="221.635"
          height="43.614"
          rx="6"
          fill="url(#paint36_linear_70_397)"
        />
        <rect
          x="421.053"
          y="857"
          width="1407.2"
          height="40"
          rx="6"
          fill="url(#paint37_linear_70_397)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_70_397"
          x1="223.92"
          y1="10.2032"
          x2="852.668"
          y2="10.2031"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_70_397"
          x1="174.363"
          y1="34.2032"
          x2="1090.32"
          y2="34.2031"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_70_397"
          x1="1684.06"
          y1="22.6524"
          x2="1893.64"
          y2="22.6524"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_70_397"
          x1="663.815"
          y1="101.527"
          x2="1199.42"
          y2="101.527"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_70_397"
          x1="351.496"
          y1="132.479"
          x2="1477.03"
          y2="132.478"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_70_397"
          x1="853.825"
          y1="68.4786"
          x2="1979.36"
          y2="68.4784"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_70_397"
          x1="392.5"
          y1="189.127"
          x2="483.06"
          y2="189.127"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_70_397"
          x1="484.886"
          y1="188.503"
          x2="741.043"
          y2="188.503"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_70_397"
          x1="1115.34"
          y1="189.376"
          x2="1180.02"
          y2="189.376"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_70_397"
          x1="1156.53"
          y1="188.503"
          x2="1630.03"
          y2="188.503"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint10_linear_70_397"
          x1="-64.7775"
          y1="256.503"
          x2="695.93"
          y2="256.503"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint11_linear_70_397"
          x1="-122.371"
          y1="292.406"
          x2="972.116"
          y2="292.406"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint12_linear_70_397"
          x1="-20.5779"
          y1="340.503"
          x2="483.973"
          y2="340.503"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint13_linear_70_397"
          x1="939.941"
          y1="256.503"
          x2="1560.93"
          y2="256.503"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint14_linear_70_397"
          x1="858.239"
          y1="292.406"
          x2="1952.73"
          y2="292.406"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint15_linear_70_397"
          x1="960.032"
          y1="340.503"
          x2="1464.58"
          y2="340.503"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint16_linear_70_397"
          x1="-87.0598"
          y1="409.027"
          x2="417.491"
          y2="409.027"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint17_linear_70_397"
          x1="75.8128"
          y1="460.877"
          x2="203.683"
          y2="460.877"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint18_linear_70_397"
          x1="-139.539"
          y1="454.802"
          x2="2274.54"
          y2="454.801"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint19_linear_70_397"
          x1="1752.31"
          y1="457.251"
          x2="1791.12"
          y2="457.251"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint20_linear_70_397"
          x1="-98.0186"
          y1="476.802"
          x2="2075.43"
          y2="476.801"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint21_linear_70_397"
          x1="80.7423"
          y1="530.847"
          x2="200.316"
          y2="530.847"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint22_linear_70_397"
          x1="-139.539"
          y1="524.802"
          x2="2274.54"
          y2="524.801"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint23_linear_70_397"
          x1="1752.31"
          y1="527.251"
          x2="1791.12"
          y2="527.251"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint24_linear_70_397"
          x1="-98.0186"
          y1="546.802"
          x2="2075.43"
          y2="546.801"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint25_linear_70_397"
          x1="-206.265"
          y1="637.027"
          x2="989.133"
          y2="637.026"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint26_linear_70_397"
          x1="2.19152"
          y1="702.282"
          x2="374.783"
          y2="702.282"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint27_linear_70_397"
          x1="105.689"
          y1="767.421"
          x2="265.059"
          y2="767.421"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint28_linear_70_397"
          x1="80.85"
          y1="699.005"
          x2="2052.48"
          y2="699.005"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint29_linear_70_397"
          x1="80.85"
          y1="755.682"
          x2="2052.48"
          y2="755.682"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint30_linear_70_397"
          x1="450.549"
          y1="807.202"
          x2="520.41"
          y2="807.202"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint31_linear_70_397"
          x1="447.84"
          y1="806.652"
          x2="998.965"
          y2="806.652"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint32_linear_70_397"
          x1="1028.16"
          y1="807.443"
          x2="1105.78"
          y2="807.443"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint33_linear_70_397"
          x1="994.734"
          y1="806.652"
          x2="1747.68"
          y2="806.652"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint34_linear_70_397"
          x1="70.7413"
          y1="878.51"
          x2="349.138"
          y2="878.51"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint35_linear_70_397"
          x1="45.3423"
          y1="877.694"
          x2="338.022"
          y2="877.694"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint36_linear_70_397"
          x1="29.5203"
          y1="875.542"
          x2="340.053"
          y2="875.542"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <linearGradient
          id="paint37_linear_70_397"
          x1="80.85"
          y1="874.005"
          x2="2052.48"
          y2="874.005"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F1EFEF" />
          <stop offset="0.53125" stopColor="#F9F8F8" />
          <stop offset="0.992158" stopColor="#E7E5E5" />
        </linearGradient>
        <clipPath id="clip0_70_397">
          <rect width="2000" height="900" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
const DotLoader = () => {
  return (
    <div className="flex justify-center items-center gap-1 h-8">
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0s]"></span>
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </div>
  );
};

export default DotLoader;

export const AddSaleIcon = () => {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <line 
        x1="10.95" 
        y1="20.5" 
        x2="11.05" 
        y2="20.5" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2.5"
      />
      <line 
        x1="16.95" 
        y1="20.5" 
        x2="17.05" 
        y2="20.5" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2.5"
      />
      <path 
        d="M14,5v6m3-3H11" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2"
      />
      <path 
        d="M3,3H5.2a1,1,0,0,1,1,.78L8.82,15.22a1,1,0,0,0,1,.78h8.42a1,1,0,0,0,1-.76L21,8" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2"
      />
    </svg>
  );
};