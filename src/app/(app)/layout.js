"use client"
import Navbar from "@/components/Navbar";
import { ApolloProvider } from "@apollo/client";
import client from "@/lib/apolloClient";
import Footer from "@/components/Footer";


export default function RootLayout({ children }) {
  return (
    <>
      <ApolloProvider client={client}>
        <Navbar/>
        {children}
        <Footer/>
      </ApolloProvider>  
        
    </>
  );
}
