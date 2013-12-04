package skymonitor.datacollector;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.Timer;
import java.util.TimerTask;

import javax.servlet.*;

import com.sun.xml.internal.bind.v2.ContextFactory;

import sun.org.mozilla.javascript.internal.Context;

public class dataCollector {
    
    public static void main(String...args)
    {
    	String server = "localhost";
    	String database = "db2";
    	Database databaseInstance = new Database (server, database);
    	
        TimerTask task = new TimerTask()
        {
            @Override
            public void run()
            {
                //fin ouverture du repeteur
                
                try {
                    URL sourceDonnees = new URL("http://db.flightradar24.com/zones/full_all.js"); // Définition de la source de données
                    URLConnection connexion = sourceDonnees.openConnection(); // Ouverture de la connection
                    
                    InputStream  flux = connexion.getInputStream(); // Définition du flux de données
                    int donneesALire = connexion.getContentLength(); //Lecture des données
                    
                    for(;donneesALire != 0; donneesALire--)
                        
                        System.out.print((char)flux.read());
                }
                
                catch (Exception e)
                {
                    e.printStackTrace();
                }
                
                //fermeture du repeteur
            }	
        };
        Timer timer = new Timer();
        timer.scheduleAtFixedRate(task, 0, 5000);		
        //fin fermeture du repeteur
        
    }
	
}