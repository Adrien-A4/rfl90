"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();

  const handleDiscordLogin = () => {
    router.replace("/api/auth/discord");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-2xl p-8 border border-border transition-colors duration-300">
          <div className="text-center mb-8">
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold tracking-tight mb-2"
            >
              RFL <span className="text-muted-foreground/60">90'</span>
            </motion.h1>
            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground/60 text-sm"
            >
              Sign in to continue
            </motion.p>
          </div>
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={handleDiscordLogin}
            className="w-full bg-black hover:bg-black/80 text-white font-medium py-3.5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 group border border-white/10 hover:border-white/20"
          >
            <div className="relative w-6 h-6">
              <Image
                src="/discord.png"
                alt="Discord"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <span>Continue with Discord</span>
          </motion.button>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-xs text-muted-foreground/40 mt-6"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-muted-foreground/60">
            You'll be added to the server once you've signed up.{" "}
            <button className="text-white/80 hover:text-white transition-colors font-medium">
              Don't agree? Contact the server owner.
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
