
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div>
          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
            anotefacil
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Simplifique suas anotações
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Button
            className="w-full sm:w-auto px-8 py-6 text-lg bg-purple-50 text-purple-900 hover:bg-purple-100 transition-all duration-300"
          >
            Começar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Index;
