

export default function Layout({ children }) {
    return (
        <div className="m-0 p-0">
            <Head>
                <title>ICP Hub</title>
            </Head>
            <div className={`min-h-screen w-auto extraClasses bg-[#0A121F] md:bg-[#060B13] `}>
                <div className="mainPageContainer  ">
                    <div className="homeContainer md:pt-[15px] md:pb-[15px] md:pr-[15px] ">

                        <div className={`homeInside px-[25px] md:px-[48px] md:py-[5px]  bg-[#0A121F] md:transparentBorder`}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
